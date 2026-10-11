// Audiolibros Gratis — servidor.
// Trae audiolibros libres de archive.org (grabaciones de LibriVox) y podcasts del
// directorio de Apple. El audio NO pasa por acá: la app lo reproduce directo desde
// archive.org o desde el servidor de cada podcast. Este servidor solo arma listas y guarda caché.

const express = require('express');
const path = require('path');
const { XMLParser } = require('fast-xml-parser');

const PORT = process.env.PORT || 3050;
const ARCHIVE = process.env.ARCHIVE_BASE || 'https://archive.org';
const ITUNES = process.env.ITUNES_BASE || 'https://itunes.apple.com';
const APPLE_RSS = process.env.APPLE_RSS_BASE || 'https://rss.applemarketingtools.com';
const PAIS = process.env.PAIS || 'ar';

const app = express();
app.disable('x-powered-by');

// La app (Capacitor) llama desde otro origen.
app.use(['/api', '/contenido'], (req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  next();
});

// ---------- Caché en memoria ----------
const cache = new Map();
async function conCache(clave, segundos, fn) {
  const c = cache.get(clave);
  if (c && c.vence > Date.now()) return c.valor;
  try {
    const valor = await fn();
    cache.set(clave, { valor, vence: Date.now() + segundos * 1000 });
    if (cache.size > 3000) cache.delete(cache.keys().next().value);
    return valor;
  } catch (e) {
    if (c) return c.valor; // si falla la fuente, devolvemos lo último que teníamos
    throw e;
  }
}

async function traer(url, tipo = 'json') {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    const r = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'AudiolibrosGratis/1.0 (+https://dmith.app)' },
      redirect: 'follow'
    });
    if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + url);
    return tipo === 'json' ? r.json() : r.text();
  } finally {
    clearTimeout(t);
  }
}

// ---------- Utilidades ----------
const limpiarHtml = s => String(s || '')
  .replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n\n').replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\n{3,}/g, '\n\n').trim();
const uno = v => Array.isArray(v) ? v[0] : v;
const lista = v => v == null ? [] : Array.isArray(v) ? v : [v];

function segundos(v) {
  if (v == null || v === '') return 0;
  const s = String(v).trim();
  if (/^\d+(\.\d+)?$/.test(s)) return Math.round(parseFloat(s));
  const p = s.split(':').map(Number);
  if (p.some(isNaN)) return 0;
  return p.reduce((a, b) => a * 60 + b, 0);
}

// Título de LibriVox: "Cuentos de la selva (Quiroga)" o "... - Horacio Quiroga" → limpio
function tituloLimpio(t) {
  return String(uno(t) || '').replace(/\s*\(.*?librivox.*?\)/i, '').replace(/\s*-\s*librivox.*$/i, '').trim();
}
function autorLimpio(a) {
  let s = String(uno(a) || '').trim();
  // archive.org suele guardar "Apellido, Nombre" o "Apellido, Nombre, 1878-1937"
  s = s.replace(/,?\s*\d{3,4}\s*-\s*\d{0,4}\.?$/, '').trim();
  const m = s.match(/^([^,]+),\s*([^,]+)$/);
  return m ? m[2] + ' ' + m[1] : s;
}

// ---------- Audiolibros (archive.org, colección LibriVox) ----------
const IDIOMA = '(language:(spa OR Spanish OR español OR Español))';
const CATEGORIAS = {
  cuentos:   { nombre: 'Cuentos',    q: '(subject:(cuento* OR "short stories" OR relatos) OR title:(cuento* OR relatos))' },
  novela:    { nombre: 'Novela',     q: '(subject:(novela OR fiction OR "general fiction") OR title:novela)' },
  poesia:    { nombre: 'Poesía',     q: '(subject:(poes* OR poetry OR poemas OR versos) OR title:(poes* OR poemas OR rimas OR versos))' },
  infantil:  { nombre: 'Infantil',   q: '(subject:(infantil OR children* OR niños OR fábulas OR fabulas OR "fairy tales") OR title:(fábulas OR fabulas OR niños))' },
  historia:  { nombre: 'Historia',   q: '(subject:(historia OR history OR biograf*) OR title:(historia OR vida))' },
  filosofia: { nombre: 'Filosofía',  q: '(subject:(filosof* OR philosophy OR religion OR religión) OR title:(filosof* OR diálogos))' },
  teatro:    { nombre: 'Teatro',     q: '(subject:(teatro OR drama OR comedia) OR title:(comedia OR drama))' },
  misterio:  { nombre: 'Misterio y terror', q: '(subject:(misterio OR mystery OR terror OR horror OR detective OR fantasmas) OR title:(misterio OR fantasmas OR leyendas))' }
};

function aLibroCorto(d) {
  return {
    id: d.identifier,
    tipo: 'libro',
    titulo: tituloLimpio(d.title),
    autor: autorLimpio(d.creator),
    portada: `${ARCHIVE}/services/img/${encodeURIComponent(d.identifier)}`,
    descargas: d.downloads || 0
  };
}

async function buscarLibros({ q = '', cat = '', pagina = 1, filas = 30, orden = 'downloads desc' }) {
  let consulta = `collection:(librivoxaudio) AND ${IDIOMA} AND mediatype:(audio)`;
  if (cat && CATEGORIAS[cat]) consulta += ' AND ' + CATEGORIAS[cat].q;
  if (q) {
    const t = q.replace(/[^\p{L}\p{N}\s'-]/gu, ' ').trim();
    if (t) consulta += ` AND (title:(${t}) OR creator:(${t}) OR subject:(${t}))`;
  }
  const p = new URLSearchParams({ q: consulta, rows: String(filas), page: String(pagina), output: 'json' });
  ['identifier', 'title', 'creator', 'downloads'].forEach(f => p.append('fl[]', f));
  p.append('sort[]', orden);
  const clave = 'libros:' + p.toString();
  return conCache(clave, 6 * 3600, async () => {
    const r = await traer(`${ARCHIVE}/advancedsearch.php?${p}`);
    const docs = (r.response && r.response.docs) || [];
    return { total: (r.response && r.response.numFound) || 0, libros: docs.map(aLibroCorto) };
  });
}

async function libro(id) {
  if (!/^[\w.-]+$/.test(id)) throw Object.assign(new Error('id inválido'), { status: 400 });
  return conCache('libro:' + id, 24 * 3600, async () => {
    const r = await traer(`${ARCHIVE}/metadata/${encodeURIComponent(id)}`);
    if (!r || !r.metadata) throw Object.assign(new Error('No encontrado'), { status: 404 });
    const m = r.metadata;
    const archivos = lista(r.files);
    // Preferimos los MP3 de 64 kbps (livianos); si no hay, cualquier MP3.
    let mp3 = archivos.filter(f => /64kbps mp3/i.test(f.format || ''));
    if (!mp3.length) mp3 = archivos.filter(f => /mp3/i.test(f.format || '') && f.source === 'original');
    if (!mp3.length) mp3 = archivos.filter(f => /\.mp3$/i.test(f.name || ''));
    mp3.sort((a, b) => (parseInt(a.track) || 0) - (parseInt(b.track) || 0) || String(a.name).localeCompare(String(b.name), undefined, { numeric: true }));
    const capitulos = mp3.map((f, i) => ({
      n: i + 1,
      titulo: (f.title && String(uno(f.title)).trim()) || ('Capítulo ' + (i + 1)),
      duracion: segundos(f.length),
      url: `${ARCHIVE}/download/${encodeURIComponent(id)}/${f.name.split('/').map(encodeURIComponent).join('/')}`
    }));
    const lectores = [...new Set(archivos.map(f => f.artist).filter(Boolean).map(a => String(uno(a)).trim()))].slice(0, 4);
    return {
      id,
      tipo: 'libro',
      titulo: tituloLimpio(m.title),
      autor: autorLimpio(m.creator),
      portada: `${ARCHIVE}/services/img/${encodeURIComponent(id)}`,
      descripcion: limpiarHtml(uno(m.description)).replace(/\(?\s*Summary by[^\n]*$/i, '').trim().slice(0, 1500),
      lectores,
      duracion: capitulos.reduce((a, c) => a + c.duracion, 0),
      capitulos,
      fuente: 'LibriVox · archive.org',
      licencia: 'Dominio público'
    };
  });
}

// ---------- Podcasts (directorio de Apple + RSS de cada podcast) ----------
const GENEROS_POD = {
  historia: { nombre: 'Historia', term: 'historia' },
  ciencia: { nombre: 'Ciencia', term: 'ciencia' },
  cuentos: { nombre: 'Cuentos y relatos', term: 'cuentos relatos' },
  terror: { nombre: 'Terror y misterio', term: 'terror misterio' },
  negocios: { nombre: 'Negocios', term: 'emprendedores negocios' },
  humor: { nombre: 'Humor', term: 'humor' },
  bienestar: { nombre: 'Bienestar', term: 'meditación bienestar' },
  audiolibros: { nombre: 'Audiolibros en podcast', term: 'audiolibro' }
};

const grande = u => String(u || '').replace(/\/\d+x\d+(bb)?\.(jpg|png|webp)$/i, '/600x600bb.jpg');

function aPodCorto(r) {
  return {
    id: String(r.collectionId || r.id),
    tipo: 'podcast',
    titulo: r.collectionName || r.name,
    autor: r.artistName,
    portada: grande(r.artworkUrl600 || r.artworkUrl100),
    genero: r.primaryGenreName || (r.genres && r.genres[0] && (r.genres[0].name || r.genres[0])) || ''
  };
}

async function topPodcasts(n = 25) {
  return conCache('top:' + PAIS + n, 6 * 3600, async () => {
    const r = await traer(`${APPLE_RSS}/api/v2/${PAIS}/podcasts/top/${n}/podcasts.json`);
    return ((r.feed && r.feed.results) || []).map(aPodCorto);
  });
}

async function buscarPodcasts(term, n = 25) {
  const p = new URLSearchParams({ media: 'podcast', term, country: PAIS, limit: String(n) });
  return conCache('pods:' + p, 6 * 3600, async () => {
    const r = await traer(`${ITUNES}/search?${p}`);
    return (r.results || []).filter(x => x.feedUrl).map(aPodCorto);
  });
}

const xml = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_', textNodeName: '#t', cdataPropName: false, processEntities: true, htmlEntities: true });
const texto = v => v == null ? '' : typeof v === 'object' ? (v['#t'] != null ? String(v['#t']) : '') : String(v);

async function podcast(id) {
  if (!/^\d+$/.test(id)) throw Object.assign(new Error('id inválido'), { status: 400 });
  return conCache('pod:' + id, 3600, async () => {
    const l = await traer(`${ITUNES}/lookup?id=${id}&entity=podcast`);
    const info = (l.results || [])[0];
    if (!info || !info.feedUrl) throw Object.assign(new Error('No encontrado'), { status: 404 });
    const rss = xml.parse(await traer(info.feedUrl, 'text'));
    const ch = (rss.rss && rss.rss.channel) || {};
    const episodios = lista(ch.item).map(it => {
      const enc = uno(it.enclosure) || {};
      const img = it['itunes:image'] && it['itunes:image']['@_href'];
      return {
        id: texto(it.guid) || enc['@_url'],
        titulo: limpiarHtml(texto(it.title)),
        fecha: it.pubDate ? new Date(texto(it.pubDate)).toISOString() : null,
        duracion: segundos(texto(it['itunes:duration'])),
        descripcion: limpiarHtml(texto(it['itunes:summary']) || texto(it.description)).slice(0, 600),
        url: enc['@_url'],
        portada: img || null
      };
    }).filter(e => e.url && /^https?:/i.test(e.url)).slice(0, 100);
    return {
      ...aPodCorto(info),
      descripcion: limpiarHtml(texto(ch.description) || texto(ch['itunes:summary'])).slice(0, 1200),
      episodios
    };
  });
}

// ---------- Contenido propio (narrado con Kokoro) ----------
const PROPIOS = require('./public/contenido/propios.json');

// ---------- Rutas ----------
const ruta = fn => async (req, res) => {
  try {
    res.set('Cache-Control', 'public, max-age=600');
    res.json(await fn(req));
  } catch (e) {
    console.error(e.message);
    res.status(e.status || 502).json({ error: e.status ? e.message : 'No pudimos traer el contenido. Probá de nuevo en un rato.' });
  }
};

const seguro = p => p.catch(e => { console.error(e.message); return null; });

app.get('/api/inicio', ruta(async () => {
  const [top, populares, cuentos, poesia, infantil, misterio, podHistoria, podCuentos] = await Promise.all([
    seguro(topPodcasts(20)),
    seguro(buscarLibros({ filas: 20 })),
    seguro(buscarLibros({ cat: 'cuentos', filas: 20 })),
    seguro(buscarLibros({ cat: 'poesia', filas: 20 })),
    seguro(buscarLibros({ cat: 'infantil', filas: 20 })),
    seguro(buscarLibros({ cat: 'misterio', filas: 20 })),
    seguro(buscarPodcasts(GENEROS_POD.historia.term, 20)),
    seguro(buscarPodcasts(GENEROS_POD.cuentos.term, 20))
  ]);
  const filas = [];
  const fila = (id, titulo, items, extra = {}) => { if (items && items.length) filas.push({ id, titulo, items, ...extra }); };
  fila('propios', 'Narrados por nosotros', PROPIOS.libros.map(({ capitulos, texto, ...r }) => r));
  fila('top-libros', 'Top 10 audiolibros', populares && populares.libros.slice(0, 10), { estilo: 'top10' });
  fila('top-pods', 'Podcasts más escuchados', top);
  fila('cuentos', 'Cuentos', cuentos && cuentos.libros, { cat: 'cuentos' });
  fila('pod-historia', 'Podcasts de historia', podHistoria);
  fila('poesia', 'Poesía', poesia && poesia.libros, { cat: 'poesia' });
  fila('infantil', 'Para chicos', infantil && infantil.libros, { cat: 'infantil' });
  fila('pod-cuentos', 'Relatos en podcast', podCuentos);
  fila('misterio', 'Misterio y terror', misterio && misterio.libros, { cat: 'misterio' });
  fila('populares', 'Más escuchados', populares && populares.libros.slice(10), { cat: '' });
  return { destacado: PROPIOS.destacado, filas };
}));

app.get('/api/categorias', ruta(async () => ({
  libros: Object.entries(CATEGORIAS).map(([id, c]) => ({ id, nombre: c.nombre })),
  podcasts: Object.entries(GENEROS_POD).map(([id, c]) => ({ id, nombre: c.nombre }))
})));

app.get('/api/libros', ruta(req => buscarLibros({
  q: String(req.query.q || '').slice(0, 80),
  cat: String(req.query.cat || ''),
  pagina: Math.max(1, Math.min(50, parseInt(req.query.pagina) || 1)),
  filas: 30
})));

app.get('/api/libro/:id', ruta(req => {
  const propio = PROPIOS.libros.find(l => l.id === req.params.id);
  return propio ? propio : libro(req.params.id);
}));

app.get('/api/podcasts', ruta(async req => {
  const g = GENEROS_POD[req.query.genero];
  const q = String(req.query.q || '').slice(0, 80).trim();
  if (q) return { podcasts: await buscarPodcasts(q, 30) };
  if (g) return { podcasts: await buscarPodcasts(g.term, 30) };
  return { podcasts: await topPodcasts(50) };
}));

app.get('/api/podcast/:id', ruta(req => podcast(req.params.id)));

app.get('/api/buscar', ruta(async req => {
  const q = String(req.query.q || '').slice(0, 80).trim();
  if (q.length < 2) return { libros: [], podcasts: [] };
  const sin = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const propios = PROPIOS.libros.filter(l => sin(l.titulo + ' ' + l.autor).includes(sin(q))).map(({ capitulos, texto, ...r }) => r);
  const [l, p] = await Promise.all([seguro(buscarLibros({ q, filas: 30 })), seguro(buscarPodcasts(q, 20))]);
  return { libros: propios.concat((l && l.libros) || []), podcasts: p || [] };
}));

app.use('/api', (req, res) => res.status(404).json({ error: 'No existe' }));

// La app web
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1h', extensions: ['html'] }));
app.get(/^\/(?!api).*/, (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

if (require.main === module) {
  app.listen(PORT, '127.0.0.1', () => console.log('Audiolibros Gratis en http://127.0.0.1:' + PORT));
}
module.exports = app;

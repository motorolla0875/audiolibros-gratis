// Audiolibros Gratis — servidor.
// Trae audiolibros libres de archive.org (grabaciones de LibriVox) y podcasts del
// directorio de Apple. El audio NO pasa por acá: la app lo reproduce directo desde
// archive.org o desde el servidor de cada podcast. Este servidor solo arma listas y guarda caché.

const express = require('express');
const fs = require('fs');
const path = require('path');
const { XMLParser } = require('fast-xml-parser');

const PORT = process.env.PORT || 3050;
const ARCHIVE = process.env.ARCHIVE_BASE || 'https://archive.org';
const ITUNES = process.env.ITUNES_BASE || 'https://itunes.apple.com';
const APPLE_RSS = process.env.APPLE_RSS_BASE || 'https://rss.applemarketingtools.com';
// Podcast Index (directorio abierto). Se activa solo si están las claves.
const PI = process.env.PODCASTINDEX_BASE || 'https://api.podcastindex.org';
const PI_KEY = process.env.PODCASTINDEX_KEY || '';
const PI_SECRET = process.env.PODCASTINDEX_SECRET || '';
// Enlace de afiliado para "Comprar en papel". {q} se reemplaza por título + autor.
// Ejemplo: AFILIADO_URL="https://www.amazon.com/s?k={q}&tag=TU-TAG-20"
const AFILIADO_URL = process.env.AFILIADO_URL || '';

const app = express();
app.disable('x-powered-by');

// La app (Capacitor) llama desde otro origen.
app.use(['/api', '/contenido'], (req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  next();
});

// ---------- Idiomas ----------
// Cada idioma busca libros en su lengua y podcasts del ranking de un país.
const IDIOMAS = {
  es: { lang: '(spa OR Spanish OR español OR Español)', pais: 'ar' },
  en: { lang: '(eng OR English)', pais: 'us' },
  pt: { lang: '(por OR Portuguese OR português OR Português)', pais: 'br' }
};
const idiomaDe = req => IDIOMAS[req.query.idioma] ? req.query.idioma : 'es';
const T = {
  propios: { es: 'Narrados por nosotros' },
  seleccion: { es: 'Selección de la casa', en: 'Our picks', pt: 'Seleção da casa' },
  topLibros: { es: 'Top 10 audiolibros', en: 'Top 10 audiobooks', pt: 'Top 10 audiolivros' },
  topPods: { es: 'Podcasts más escuchados', en: 'Top podcasts', pt: 'Podcasts mais ouvidos' },
  podHistoria: { es: 'Podcasts de historia', en: 'History podcasts', pt: 'Podcasts de história' },
  podCuentos: { es: 'Relatos en podcast', en: 'Story podcasts', pt: 'Histórias em podcast' },
  populares: { es: 'Más escuchados', en: 'Most listened', pt: 'Mais ouvidos' },
  destacado: { es: 'Destacado', en: 'Featured', pt: 'Destaque' },
  gratis: { es: 'Gratis', en: 'Free', pt: 'Grátis' }
};

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

async function traer(url, tipo = 'json', extra = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    const r = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'AudiolibrosGratis/1.0 (+https://dmith.app)', ...extra },
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
const sinAcentos = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

function segundos(v) {
  if (v == null || v === '') return 0;
  const s = String(v).trim();
  if (/^\d+(\.\d+)?$/.test(s)) return Math.round(parseFloat(s));
  const p = s.split(':').map(Number);
  if (p.some(isNaN)) return 0;
  return p.reduce((a, b) => a * 60 + b, 0);
}

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
const CATEGORIAS = {
  cuentos:   { nombre: { es: 'Cuentos', en: 'Short stories', pt: 'Contos' },
               q: '(subject:(cuento* OR "short stories" OR relatos OR contos) OR title:(cuento* OR relatos OR stories OR contos))' },
  novela:    { nombre: { es: 'Novela', en: 'Novels', pt: 'Romance' },
               q: '(subject:(novela OR fiction OR "general fiction" OR romance) OR title:(novela OR novel))' },
  poesia:    { nombre: { es: 'Poesía', en: 'Poetry', pt: 'Poesia' },
               q: '(subject:(poes* OR poetry OR poemas OR versos OR poems) OR title:(poes* OR poemas OR rimas OR versos OR poems))' },
  infantil:  { nombre: { es: 'Infantil', en: 'Kids', pt: 'Infantil' },
               q: '(subject:(infantil OR children* OR niños OR fábulas OR fabulas OR "fairy tales" OR crianças) OR title:(fábulas OR fabulas OR niños OR fairy OR fables))' },
  historia:  { nombre: { es: 'Historia', en: 'History', pt: 'História' },
               q: '(subject:(historia OR history OR história OR biograf*) OR title:(historia OR history OR vida OR life))' },
  filosofia: { nombre: { es: 'Filosofía', en: 'Philosophy', pt: 'Filosofia' },
               q: '(subject:(filosof* OR philosophy OR religion OR religión) OR title:(filosof* OR diálogos OR philosophy))' },
  teatro:    { nombre: { es: 'Teatro', en: 'Drama', pt: 'Teatro' },
               q: '(subject:(teatro OR drama OR comedia OR plays) OR title:(comedia OR drama OR play))' },
  misterio:  { nombre: { es: 'Misterio y terror', en: 'Mystery & horror', pt: 'Mistério e terror' },
               q: '(subject:(misterio OR mystery OR terror OR horror OR detective OR fantasmas OR ghost OR mistério) OR title:(misterio OR fantasmas OR leyendas OR mystery OR ghost))' }
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

async function buscarLibros({ idioma = 'es', q = '', cat = '', ids = null, pagina = 1, filas = 30, orden = 'downloads desc' }) {
  let consulta = `collection:(librivoxaudio) AND mediatype:(audio) AND NOT title:(Bible OR "Reina Valera" OR Biblia) AND NOT creator:("Reina Valera" OR "Reina-Valera" OR "Casiodoro de Reina")`;
  if (ids) consulta += ` AND identifier:(${ids.map(i => '"' + i + '"').join(' OR ')})`;
  else consulta += ` AND language:${IDIOMAS[idioma].lang}`;
  if (cat && CATEGORIAS[cat]) consulta += ' AND ' + CATEGORIAS[cat].q;
  if (q) {
    const t = q.replace(/[^\p{L}\p{N}\s'-]/gu, ' ').trim();
    if (t) consulta += ` AND (title:(${t}) OR creator:(${t}) OR subject:(${t}))`;
  }
  const p = new URLSearchParams({ q: consulta, rows: String(filas), page: String(pagina), output: 'json' });
  ['identifier', 'title', 'creator', 'downloads'].forEach(f => p.append('fl[]', f));
  p.append('sort[]', orden);
  return conCache('libros:' + p.toString(), 6 * 3600, async () => {
    const r = await traer(`${ARCHIVE}/advancedsearch.php?${p}`);
    const docs = (r.response && r.response.docs) || [];
    let libros = docs.map(aLibroCorto);
    if (ids) libros.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
    return { total: (r.response && r.response.numFound) || 0, libros };
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
      tamano: parseInt(f.size) || 0,
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

// Portada en tamaño grande (archive.org tiene la tapa original además de la miniatura).
async function portadaGrande(id) {
  return conCache('tapa:' + id, 7 * 24 * 3600, async () => {
    const r = await traer(`${ARCHIVE}/metadata/${encodeURIComponent(id)}`);
    const jpg = lista(r && r.files).filter(f => /^(JPEG|PNG)$/i.test(f.format || '') && !/thumb|_itemimage/i.test(f.name || ''))
      .sort((a, b) => (parseInt(b.size) || 0) - (parseInt(a.size) || 0))[0];
    return jpg ? `${ARCHIVE}/download/${encodeURIComponent(id)}/${jpg.name.split('/').map(encodeURIComponent).join('/')}` : null;
  });
}

// ---------- Selección armada a mano ----------
// contenido/seleccion.json: { "es": ["id1", "id2"], "en": [...], "pt": [...] }
// Si un idioma no tiene lista, se usan los más descargados.
function seleccion(idioma) {
  try {
    const s = JSON.parse(fs.readFileSync(path.join(__dirname, 'contenido', 'seleccion.json'), 'utf8'));
    return Array.isArray(s[idioma]) && s[idioma].length ? s[idioma] : null;
  } catch (e) { return null; }
}

// ---------- Podcasts (directorio de Apple + RSS de cada podcast) ----------
const GENEROS_POD = {
  historia:    { nombre: { es: 'Historia', en: 'History', pt: 'História' }, term: { es: 'historia', en: 'history', pt: 'história' } },
  ciencia:     { nombre: { es: 'Ciencia', en: 'Science', pt: 'Ciência' }, term: { es: 'ciencia', en: 'science', pt: 'ciência' } },
  cuentos:     { nombre: { es: 'Cuentos y relatos', en: 'Stories', pt: 'Contos e histórias' }, term: { es: 'cuentos relatos', en: 'stories fiction', pt: 'contos histórias' } },
  terror:      { nombre: { es: 'Terror y misterio', en: 'Horror & mystery', pt: 'Terror e mistério' }, term: { es: 'terror misterio', en: 'horror mystery', pt: 'terror mistério' } },
  negocios:    { nombre: { es: 'Negocios', en: 'Business', pt: 'Negócios' }, term: { es: 'emprendedores negocios', en: 'business entrepreneur', pt: 'negócios empreendedorismo' } },
  humor:       { nombre: { es: 'Humor', en: 'Comedy', pt: 'Humor' }, term: { es: 'humor', en: 'comedy', pt: 'humor' } },
  bienestar:   { nombre: { es: 'Bienestar', en: 'Wellness', pt: 'Bem-estar' }, term: { es: 'meditación bienestar', en: 'meditation wellness', pt: 'meditação bem-estar' } },
  aprender:    { nombre: { es: 'Aprender', en: 'Learning', pt: 'Aprender' }, term: { es: 'aprender educación', en: 'learning education', pt: 'aprender educação' } },
  audiolibros: { nombre: { es: 'Audiolibros en podcast', en: 'Audiobook podcasts', pt: 'Audiolivros em podcast' }, term: { es: 'audiolibro', en: 'audiobook', pt: 'audiolivro' } }
};

const grande = u => String(u || '').replace(/\/\d+x\d+(bb)?\.(jpg|png|webp)$/i, '/600x600bb.jpg');
// Ocultamos lo marcado como contenido para adultos, así la app es apta para todo público.
const esExplicito = r => /^explicit$/i.test(r.collectionExplicitness || '') || /^explicit$/i.test(r.contentAdvisoryRating || '') || /^explicit$/i.test(r.trackExplicitness || '');
const siExplicito = v => /^(yes|true|explicit)$/i.test(String(v == null ? '' : (typeof v === 'object' ? v['#t'] : v)).trim());

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

async function topPodcasts(idioma, n = 25) {
  const pais = IDIOMAS[idioma].pais;
  return conCache('top:' + pais + n, 6 * 3600, async () => {
    const r = await traer(`${APPLE_RSS}/api/v2/${pais}/podcasts/top/${n}/podcasts.json`);
    return ((r.feed && r.feed.results) || []).filter(x => !esExplicito(x)).map(aPodCorto);
  });
}

async function buscarApple(idioma, term, n) {
  const p = new URLSearchParams({ media: 'podcast', term, country: IDIOMAS[idioma].pais, limit: String(n), explicit: 'No' });
  return conCache('pods:' + p, 6 * 3600, async () => {
    const r = await traer(`${ITUNES}/search?${p}`);
    return (r.results || []).filter(x => x.feedUrl && !esExplicito(x)).map(x => ({ ...aPodCorto(x), _feed: x.feedUrl }));
  });
}

// ---------- Podcast Index ----------
function piGet(ruta) {
  const fecha = String(Math.floor(Date.now() / 1000));
  const firma = require('crypto').createHash('sha1').update(PI_KEY + PI_SECRET + fecha).digest('hex');
  return traer(PI + '/api/1.0' + ruta, 'json', { 'X-Auth-Key': PI_KEY, 'X-Auth-Date': fecha, Authorization: firma });
}
const piIdiomaOk = (lang, idioma) => !lang || String(lang).toLowerCase().startsWith(idioma);
function aPodPI(f) {
  return { id: 'pi' + f.id, tipo: 'podcast', titulo: f.title, autor: f.author || f.ownerName || '', portada: f.artwork || f.image || '',
    genero: f.categories ? Object.values(f.categories)[0] || '' : '', _feed: f.url, _itunes: f.itunesId ? String(f.itunesId) : null };
}
async function buscarPI(idioma, term, n) {
  if (!PI_KEY || !PI_SECRET) return [];
  return conCache('pi:' + idioma + ':' + term + n, 6 * 3600, async () => {
    const r = await piGet('/search/byterm?' + new URLSearchParams({ q: term, max: String(n * 2), clean: '1' }));
    return (r.feeds || []).filter(f => !f.explicit && f.dead !== 1 && piIdiomaOk(f.language, idioma)).slice(0, n).map(aPodPI);
  });
}

// Apple no dice en qué idioma está cada podcast. Para las categorías y el inicio adivinamos por
// las palabras del título y el autor, y sacamos los que claramente están en otro idioma.
const PALABRAS = {
  es: 'el la los las de del y con que en un una por para mi tu su al se es lo como más mas pero nos cuentos historias historia humor risa risas noche vida mundo hablemos charla charlas hoy aquí aqui entre ciencia negocios mujeres hombres amigos sin todo todos'.split(' '),
  en: 'the and of with my your our show podcast hour daily life talk talks stories story news comedy funny guys girls friends what how why who this that you we it is are on to for from about with not all best new real true needs friend friends people world inside behind time week guide crime murder wondery siriusxm iheartpodcasts iheartradio npr bbc audacy cumulus coco'.split(' '),
  pt: 'o a os as de do da das e com que em um uma por para meu seu sua no na não nao mais como histórias historias humor vida mundo papo conversa ciência negócios mulheres amigos'.split(' ')
};
function idiomaProbable(texto) {
  const w = sinAcentos(texto).split(/[^a-z0-9ñç]+/).filter(Boolean);
  const pts = {};
  for (const L of Object.keys(PALABRAS)) pts[L] = w.filter(x => PALABRAS[L].includes(x)).length;
  if (/[ñ¿¡]/i.test(texto)) pts.es += 2;
  if (/[ãõç]/i.test(texto)) pts.pt += 2;
  const orden = Object.entries(pts).sort((a, b) => b[1] - a[1]);
  return orden[0][1] > orden[1][1] ? orden[0][0] : null; // null = no se sabe
}
const enIdioma = (lista, L) => (lista || []).filter(x => { const i = idiomaProbable((x.titulo || '') + ' ' + (x.autor || '')); return !i || i === L; });

// Junta Apple + Podcast Index sin repetir (mismo podcast = mismo id de Apple, mismo feed o mismo título).
async function buscarPodcasts(idioma, term, n = 25) {
  const [a, b] = await Promise.all([seguro(buscarApple(idioma, term, n)), seguro(buscarPI(idioma, term, n))]);
  if (!a && !b) throw new Error('Sin podcasts');
  const vistos = new Set(), salida = [];
  const clave = x => [x.id, x._itunes, x._feed && x._feed.replace(/^https?:\/\//, '').toLowerCase(), sinAcentos(x.titulo || '').replace(/\W+/g, '')].filter(Boolean);
  for (const x of (a || []).concat(b || [])) {
    const k = clave(x);
    if (k.some(c => vistos.has(c))) continue;
    k.forEach(c => vistos.add(c));
    const { _feed, _itunes, ...limpio } = x;
    salida.push(limpio);
  }
  return salida.slice(0, Math.max(n, (a || []).length + 10));
}

async function podcastPI(id) {
  const n = id.slice(2);
  const [f, e] = await Promise.all([piGet('/podcasts/byfeedid?id=' + n), piGet('/episodes/byfeedid?' + new URLSearchParams({ id: n, max: '100' }))]);
  const feed = f && f.feed;
  if (!feed || !feed.id) throw Object.assign(new Error('No encontrado'), { status: 404 });
  if (feed.explicit) throw Object.assign(new Error('Este podcast no está disponible.'), { status: 404 });
  const episodios = ((e && e.items) || []).filter(it => !it.explicit && it.enclosureUrl && /^https?:/i.test(it.enclosureUrl)).map(it => ({
    id: String(it.guid || it.id), titulo: limpiarHtml(it.title), fecha: it.datePublished ? new Date(it.datePublished * 1000).toISOString() : null,
    duracion: it.duration || 0, tamano: it.enclosureLength || 0, descripcion: limpiarHtml(it.description).slice(0, 600),
    url: it.enclosureUrl, portada: it.image || it.feedImage || null
  }));
  const { _feed, _itunes, ...corto } = aPodPI(feed);
  return { ...corto, descripcion: limpiarHtml(feed.description).slice(0, 1200), episodios };
}

const xml = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_', textNodeName: '#t', cdataPropName: false, processEntities: true, htmlEntities: true });
const texto = v => v == null ? '' : typeof v === 'object' ? (v['#t'] != null ? String(v['#t']) : '') : String(v);

async function podcast(id) {
  if (!/^(pi)?\d+$/.test(id)) throw Object.assign(new Error('id inválido'), { status: 400 });
  if (id.startsWith('pi')) {
    if (!PI_KEY) throw Object.assign(new Error('No encontrado'), { status: 404 });
    return conCache('pod:' + id, 3600, () => podcastPI(id));
  }
  return conCache('pod:' + id, 3600, async () => {
    const l = await traer(`${ITUNES}/lookup?id=${id}&entity=podcast`);
    const info = (l.results || [])[0];
    if (!info || !info.feedUrl) throw Object.assign(new Error('No encontrado'), { status: 404 });
    if (esExplicito(info)) throw Object.assign(new Error('Este podcast no está disponible.'), { status: 404 });
    const rss = xml.parse(await traer(info.feedUrl, 'text'));
    const ch = (rss.rss && rss.rss.channel) || {};
    if (siExplicito(ch['itunes:explicit'])) throw Object.assign(new Error('Este podcast no está disponible.'), { status: 404 });
    const episodios = lista(ch.item).filter(it => !siExplicito(it['itunes:explicit'])).map(it => {
      const enc = uno(it.enclosure) || {};
      const img = it['itunes:image'] && it['itunes:image']['@_href'];
      return {
        id: texto(it.guid) || enc['@_url'],
        titulo: limpiarHtml(texto(it.title)),
        fecha: it.pubDate && !isNaN(new Date(texto(it.pubDate))) ? new Date(texto(it.pubDate)).toISOString() : null,
        duracion: segundos(texto(it['itunes:duration'])),
        tamano: parseInt(enc['@_length']) || 0,
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

// ---------- Contenido propio (narrado con Kokoro, solo en español por ahora) ----------
const PROPIOS = require('./public/contenido/propios.json');
// Apagado por ahora: se prende con PROPIOS=1 cuando haya libros completos narrados por nosotros.
const PROPIOS_ACTIVOS = process.env.PROPIOS === '1';
const sinCapitulos = ({ capitulos, texto, ...r }) => r;

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

app.get('/api/config', ruta(async () => ({ afiliado: AFILIADO_URL ? { url: AFILIADO_URL } : null })));

app.get('/api/inicio', ruta(async req => {
  const L = idiomaDe(req), g = k => GENEROS_POD[k].term[L];
  const sel = seleccion(L);
  const [top, populares, elegidos, cuentos, poesia, infantil, misterio, podHistoria, podCuentos] = await Promise.all([
    seguro(topPodcasts(L, 25)),
    seguro(buscarLibros({ idioma: L, filas: 30 })),
    sel ? seguro(buscarLibros({ ids: sel.slice(0, 60), filas: 60 })) : null,
    seguro(buscarLibros({ idioma: L, cat: 'cuentos', filas: 20 })),
    seguro(buscarLibros({ idioma: L, cat: 'poesia', filas: 20 })),
    seguro(buscarLibros({ idioma: L, cat: 'infantil', filas: 20 })),
    seguro(buscarLibros({ idioma: L, cat: 'misterio', filas: 20 })),
    seguro(buscarPodcasts(L, g('historia'), 30).then(x => enIdioma(x, L))),
    seguro(buscarPodcasts(L, g('cuentos'), 30).then(x => enIdioma(x, L)))
  ]);
  const pop = (populares && populares.libros) || [];
  const filas = [];
  const fila = (id, titulo, items, extra = {}) => { if (items && items.length) filas.push({ id, titulo: titulo[L] || titulo.es, items, ...extra }); };
  if (L === 'es' && PROPIOS_ACTIVOS) fila('propios', T.propios, PROPIOS.libros.map(sinCapitulos));
  fila('seleccion', T.seleccion, elegidos ? elegidos.libros : pop.slice(10, 30));
  fila('top-libros', T.topLibros, pop.slice(0, 10), { estilo: 'top10' });
  fila('top-pods', T.topPods, top);
  fila('cuentos', CATEGORIAS.cuentos.nombre, cuentos && cuentos.libros, { cat: 'cuentos' });
  fila('pod-historia', T.podHistoria, podHistoria, { genero: 'historia' });
  fila('poesia', CATEGORIAS.poesia.nombre, poesia && poesia.libros, { cat: 'poesia' });
  fila('infantil', CATEGORIAS.infantil.nombre, infantil && infantil.libros, { cat: 'infantil' });
  fila('pod-cuentos', T.podCuentos, podCuentos, { genero: 'cuentos' });
  fila('misterio', CATEGORIAS.misterio.nombre, misterio && misterio.libros, { cat: 'misterio' });
  if (elegidos) fila('populares', T.populares, pop.slice(10), { cat: '' });

  // Destacados: 5 libros de la selección (o los más escuchados) que cambian cada día.
  let destacados = [];
  if (L === 'es' && PROPIOS_ACTIVOS) destacados.push(PROPIOS.destacado);
  const base = (elegidos && elegidos.libros.length) ? elegidos.libros : pop;
  if (base.length) {
    const dia = Math.floor((Date.now() - 3 * 3600e3) / 864e5); // cambia a la medianoche de Argentina
    const n = Math.min(5, base.length), inicio = (dia * n) % base.length;
    const elegidosHoy = Array.from({ length: n }, (_, k) => base[(inicio + k) % base.length]);
    const grandes = await Promise.all(elegidosHoy.map(d => seguro(portadaGrande(d.id))));
    elegidosHoy.forEach((d, k) => destacados.push({ id: d.id, titulo: d.titulo, autor: d.autor, etiqueta: T.destacado[L], generos: [d.autor, T.gratis[L]], portada: d.portada, poster: grandes[k] || d.portada }));
  }
  destacados = destacados.slice(0, 5);
  const destacado = destacados[0] || null;
  return { destacado, destacados, filas };
}));

app.get('/api/categorias', ruta(async req => {
  const L = idiomaDe(req);
  return {
    libros: Object.entries(CATEGORIAS).map(([id, c]) => ({ id, nombre: c.nombre[L] })),
    podcasts: Object.entries(GENEROS_POD).map(([id, c]) => ({ id, nombre: c.nombre[L] }))
  };
}));

app.get('/api/libros', ruta(req => {
  const L = idiomaDe(req);
  if (req.query.cat === 'seleccion') {
    const sel = seleccion(L);
    if (sel) return buscarLibros({ ids: sel, filas: 100 });
  }
  return buscarLibros({
    idioma: L,
    q: String(req.query.q || '').slice(0, 80),
    cat: String(req.query.cat || ''),
    pagina: Math.max(1, Math.min(50, parseInt(req.query.pagina) || 1)),
    filas: 30
  });
}));

app.get('/api/libro/:id', ruta(req => {
  const propio = PROPIOS.libros.find(l => l.id === req.params.id);
  return propio ? propio : libro(req.params.id);
}));

app.get('/api/podcasts', ruta(async req => {
  const L = idiomaDe(req);
  const g = GENEROS_POD[req.query.genero];
  const q = String(req.query.q || '').slice(0, 80).trim();
  if (q) return { podcasts: await buscarPodcasts(L, q, 30) };
  if (g) return { podcasts: enIdioma(await buscarPodcasts(L, g.term[L], 50), L) };
  return { podcasts: await topPodcasts(L, 50) };
}));

app.get('/api/podcast/:id', ruta(req => podcast(req.params.id)));

app.get('/api/buscar', ruta(async req => {
  const L = idiomaDe(req);
  const q = String(req.query.q || '').slice(0, 80).trim();
  if (q.length < 2) return { libros: [], podcasts: [] };
  const propios = L === 'es' && PROPIOS_ACTIVOS ? PROPIOS.libros.filter(l => sinAcentos(l.titulo + ' ' + l.autor).includes(sinAcentos(q))).map(sinCapitulos) : [];
  const [l, p] = await Promise.all([seguro(buscarLibros({ idioma: L, q, filas: 30 })), seguro(buscarPodcasts(L, q, 20))]);
  return { libros: propios.concat((l && l.libros) || []), podcasts: p || [] };
}));

// Lista de los 300 libros más escuchados de un idioma, para armar la selección a mano.
// Uso: https://audiolibros.dmith.app/api/candidatos?idioma=es
app.get('/api/candidatos', ruta(async req => {
  const L = idiomaDe(req);
  const [a, b, c] = await Promise.all([1, 2, 3].map(pagina => seguro(buscarLibros({ idioma: L, pagina, filas: 100 }))));
  return [a, b, c].filter(Boolean).flatMap(x => x.libros).map(l => `${l.id} | ${l.titulo} | ${l.autor} | ${l.descargas}`);
}));

app.use('/api', (req, res) => res.status(404).json({ error: 'No existe' }));

// La app web
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1h', extensions: ['html'] }));
app.get(/^\/(?!api).*/, (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

if (require.main === module) {
  app.listen(PORT, '127.0.0.1', () => console.log('Audiolibros Gratis en http://127.0.0.1:' + PORT));
}
module.exports = app;

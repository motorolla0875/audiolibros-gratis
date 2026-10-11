// Prueba sin internet: levanta un servidor falso que imita archive.org, Apple y un RSS,
// y verifica que la API arme bien las respuestas.  Uso: npm test
const http = require('http');
const assert = require('assert');

const MP3 = 'https://example.org/a.mp3';
const falso = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  const json = o => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(o)); };
  if (u.pathname === '/advancedsearch.php') {
    const q = u.searchParams.get('q');
    const n = q.includes('poes') ? 'poemas' : 'cuentos';
    return json({ response: { numFound: 42, docs: [
      { identifier: n + '_selva_1101_librivox', title: 'Cuentos de la Selva', creator: 'Quiroga, Horacio, 1878-1937', downloads: 9000 },
      { identifier: n + '_otro_librivox', title: ['Rimas'], creator: ['Bécquer, Gustavo Adolfo'], downloads: 500 }
    ] } });
  }
  if (u.pathname.startsWith('/download/') && u.pathname.endsWith('.jpg')) { res.setHeader('Content-Type', 'image/jpeg'); return res.end(require('fs').readFileSync(require('path').join(__dirname, '..', 'public/contenido/quijote/hero.jpg'))); }
  if (u.pathname.startsWith('/download/')) {
    res.setHeader('Access-Control-Allow-Origin', '*'); res.setHeader('Content-Type', 'audio/mpeg');
    return res.end(require('fs').readFileSync(require('path').join(__dirname, '..', 'public/contenido/quijote/cap1-ef_dora.mp3')));
  }
  if (u.pathname.startsWith('/services/img/')) { res.setHeader('Content-Type', 'image/jpeg'); return res.end(require('fs').readFileSync(require('path').join(__dirname, '..', 'public/contenido/quijote/portada.jpg'))); }
  if (u.pathname === '/api/1.0/search/byterm') {
    if (!req.headers['x-auth-key'] || !req.headers.authorization) { res.statusCode = 401; return res.end('{}'); }
    return json({ feeds: [
      { id: 77, title: 'Pod Dos', itunesId: 222, language: 'es', url: 'http://otro/feed.xml' },
      { id: 88, title: 'Solo en Podcast Index', author: 'Juan', language: 'es-AR', url: 'http://x/pi.xml', artwork: 'https://img/pi.jpg', categories: { '1': 'Arte' } },
      { id: 89, title: 'English show', language: 'en', url: 'http://x/en.xml' },
      { id: 90, title: 'Adultos PI', language: 'es', explicit: true, url: 'http://x/adult.xml' }
    ] });
  }
  if (u.pathname === '/api/1.0/podcasts/byfeedid') return json({ feed: { id: 88, title: 'Solo en Podcast Index', author: 'Juan', description: '<b>Hola</b>', artwork: 'https://img/pi.jpg' } });
  if (u.pathname === '/api/1.0/episodes/byfeedid') return json({ items: [
    { id: 1, title: 'Ep PI', datePublished: 1791600000, duration: 600, enclosureUrl: 'https://x/ep.mp3', explicit: 0 },
    { id: 2, title: 'Ep adulto', enclosureUrl: 'https://x/ep2.mp3', explicit: 1 }
  ] });
  if (u.pathname.startsWith('/metadata/')) {
    return json({ metadata: { identifier: 'x', title: 'Cuentos de la Selva', creator: 'Quiroga, Horacio, 1878-1937', description: '<p>Ocho cuentos.</p><br>(Summary by Juan)' },
      files: [
        { name: 'selva_02_quiroga_64kb.mp3', format: '64Kbps MP3', title: 'La tortuga gigante', length: '12:30', track: '2', artist: 'Ana' },
        { name: 'selva_01_quiroga_64kb.mp3', format: '64Kbps MP3', title: 'Historia de dos cachorros', length: '754.2', track: '1', artist: 'Ana' },
        { name: 'selva_01_quiroga.mp3', format: '128Kbps MP3', source: 'original' },
        { name: 'cover.jpg', format: 'JPEG' }
      ] });
  }
  if (/^\/api\/v2\/(ar|us|br)\/podcasts\/top\/\d+\/podcasts.json$/.test(u.pathname)) {
    return json({ feed: { results: [{ id: '111', name: 'Pod Uno', artistName: 'Radio X', artworkUrl100: 'https://img/a/100x100bb.jpg', genres: [{ name: 'Historia' }] }, { id: '999', name: 'Adultos', contentAdvisoryRating: 'Explicit' }] } });
  }
  if (u.pathname === '/search') {
    return json({ results: [
      { collectionId: 222, collectionName: 'Pod Dos', artistName: 'Ana', artworkUrl600: 'https://img/b/600x600bb.jpg', feedUrl: 'http://127.0.0.1:' + falso.address().port + '/feed.xml', primaryGenreName: 'Ciencia' },
      { collectionId: 333, collectionName: 'Sin feed', artistName: 'X' },
      { collectionId: 444, collectionName: 'Explícito', artistName: 'X', feedUrl: 'http://x/f', collectionExplicitness: 'explicit' }
    ] });
  }
  if (u.pathname === '/lookup') {
    return json({ results: [{ collectionId: 222, collectionName: 'Pod Dos', artistName: 'Ana', artworkUrl600: 'https://img/b/600x600bb.jpg', feedUrl: 'http://127.0.0.1:' + falso.address().port + '/feed.xml', primaryGenreName: 'Ciencia' }] });
  }
  if (u.pathname === '/feed.xml') {
    res.setHeader('Content-Type', 'application/rss+xml');
    return res.end(`<?xml version="1.0"?><rss xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" version="2.0"><channel>
      <title>Pod Dos</title><description><![CDATA[<p>Ciencia &amp; más</p>]]></description>
      <item><title>Episodio 2</title><guid isPermaLink="false">g2</guid><pubDate>Tue, 06 Oct 2026 10:00:00 GMT</pubDate><itunes:duration>01:02:03</itunes:duration><enclosure url="${MP3}" type="audio/mpeg" length="1"/><itunes:image href="https://img/ep.jpg"/></item>
      <item><title>Episodio 1</title><guid>g1</guid><pubDate>Mon, 05 Oct 2026 10:00:00 GMT</pubDate><itunes:duration>754</itunes:duration><enclosure url="${MP3}?1" type="audio/mpeg"/></item>
      <item><title>Sin audio</title></item>
      <item><title>Adulto</title><itunes:explicit>yes</itunes:explicit><enclosure url="${MP3}?x"/></item>
    </channel></rss>`);
  }
  res.statusCode = 404; res.end('no');
});

falso.listen(0, '127.0.0.1', async () => {
  const base = 'http://127.0.0.1:' + falso.address().port;
  process.env.ARCHIVE_BASE = base; process.env.ITUNES_BASE = base; process.env.APPLE_RSS_BASE = base; process.env.PODCASTINDEX_BASE = base; process.env.PODCASTINDEX_KEY = 'k'; process.env.PODCASTINDEX_SECRET = 's';
  const app = require('../server.js');
  if (process.env.DEMO) { app.listen(3050, '127.0.0.1', () => console.log('demo en 3050')); return; }
  const srv = app.listen(0, '127.0.0.1', async () => {
    const api = async r => { const x = await fetch('http://127.0.0.1:' + srv.address().port + r); return { status: x.status, body: await x.json() }; };
    try {
      let r = await api('/api/inicio');
      assert.equal(r.status, 200);
      assert.equal(r.body.destacado.etiqueta, 'Destacado');
      assert.ok(r.body.destacados.length >= 1 && r.body.destacados.length <= 5);
      const ids = r.body.filas.map(f => f.id);
      assert.ok(!ids.includes('propios') && ids.includes('top-libros') && ids.includes('top-pods'), ids.join());
      assert.equal(r.body.filas.find(f => f.id === 'top-libros').items[0].autor, 'Horacio Quiroga');

      r = await api('/api/libro/cuentos_selva_1101_librivox');
      assert.equal(r.status, 200);
      assert.deepEqual(r.body.capitulos.map(c => c.titulo), ['Historia de dos cachorros', 'La tortuga gigante']);
      assert.equal(r.body.capitulos[0].duracion, 754);
      assert.equal(r.body.capitulos[1].duracion, 750);
      assert.equal(r.body.descripcion, 'Ocho cuentos.');
      assert.deepEqual(r.body.lectores, ['Ana']);

      r = await api('/api/libro/quijote-kokoro');
      assert.equal(r.body.capitulos[0].voces.em_alex, '/contenido/quijote/cap1-em_alex.mp3');

      r = await api('/api/libro/..%2Fetc');
      assert.equal(r.status, 400);

      r = await api('/api/podcast/222');
      assert.equal(r.status, 200);
      assert.equal(r.body.episodios.length, 2);
      assert.equal(r.body.episodios[0].duracion, 3723);
      assert.equal(r.body.episodios[0].portada, 'https://img/ep.jpg');
      assert.equal(r.body.descripcion, 'Ciencia & más');

      r = await api('/api/podcasts');
      assert.equal(r.body.podcasts[0].portada, 'https://img/a/600x600bb.jpg');
      r = await api('/api/podcasts?genero=ciencia');
      assert.deepEqual(r.body.podcasts.map(x => x.id), ['222', 'pi88'], 'junta Apple + Podcast Index sin repetir ni explícitos ni otro idioma');

      r = await api('/api/podcast/pi88');
      assert.equal(r.status, 200);
      assert.equal(r.body.descripcion, 'Hola');
      assert.deepEqual(r.body.episodios.map(e => e.titulo), ['Ep PI']);

      r = await api('/api/buscar?q=quijote');
      assert.ok(!r.body.libros.some(l => l.id === 'quijote-kokoro'), 'sin propios en la búsqueda');

      r = await api('/api/inicio?idioma=en');
      assert.ok(!r.body.filas.some(f => f.id === 'propios'), 'en inglés no hay propios');
      assert.equal(r.body.destacado.etiqueta, 'Featured');
      assert.equal(r.body.filas.find(f => f.id === 'cuentos').titulo, 'Short stories');

      r = await api('/api/podcasts');
      assert.ok(!r.body.podcasts.some(x => x.id === '999'), 'oculta explícitos del ranking');

      r = await api('/api/categorias?idioma=pt');
      assert.equal(r.body.libros[0].nombre, 'Contos');

      r = await api('/api/config');
      assert.equal(r.body.afiliado, null);

      r = await api('/api/candidatos');
      assert.ok(r.body[0].includes(' | Cuentos de la Selva | Horacio Quiroga | 9000'));

      r = await api('/api/libros?cat=poesia&pagina=2');
      assert.equal(r.body.total, 42);
      console.log('Todo bien ✔');
    } catch (e) {
      console.error('Falló:', e.message); process.exitCode = 1;
    }
    srv.close(); falso.close();
  });
});

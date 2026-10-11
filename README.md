# Audiolibros Gratis

App de audiolibros gratis y podcasts en español.

- **Audiolibros**: grabaciones de LibriVox (dominio público) alojadas en archive.org.
- **Podcasts**: directorio público de Apple Podcasts + el RSS de cada podcast.
- **Narrados por nosotros**: clásicos con voz Kokoro, en `public/contenido/`.

El audio no pasa por el servidor: la app lo reproduce directo desde archive.org o desde el servidor de cada podcast. El servidor solo arma las listas y guarda caché.

## Correr
```
npm install
npm start          # http://127.0.0.1:3050
npm test           # prueba sin internet
```

## Servidor
- Proceso pm2: `audiolibros`
- nginx: `deploy/nginx-audiolibros.conf`
- Dominio: audiolibros.dmith.app

## Podcast Index (opcional)
Suma podcasts que no están en Apple. Claves gratis en https://api.podcastindex.org/signup
```
PODCASTINDEX_KEY=xxxx PODCASTINDEX_SECRET=yyyy pm2 restart audiolibros --update-env && pm2 save
```

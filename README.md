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

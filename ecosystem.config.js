// pm2: si la app pasa los 1000 MB de memoria, se reinicia sola en vez de trabar el servidor.
// (el servidor Contabo tiene 12 GB; con 300 MB se reiniciaba seguido solo por el cache de podcasts)
module.exports = {
  apps: [{
    name: 'audiolibros',
    script: 'server.js',
    max_memory_restart: '1000M',
    node_args: '--max-old-space-size=900',
    env: { NODE_ENV: 'production' }
  }]
};

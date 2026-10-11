// pm2: si la app pasa los 300 MB de memoria, se reinicia sola en vez de trabar el servidor.
module.exports = {
  apps: [{
    name: 'audiolibros',
    script: 'server.js',
    max_memory_restart: '300M',
    node_args: '--max-old-space-size=256',
    env: { NODE_ENV: 'production' }
  }]
};

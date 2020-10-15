module.exports = {
  apps: [
    {
      name: 'indico-slack-bot',
      script: './dist/app.js',
      instances: 'max',
      max_memory_restart: '256M',
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
};

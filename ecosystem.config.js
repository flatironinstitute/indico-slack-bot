module.exports = {
  apps: [
    {
      name: 'indico-slack-bot',
      script: './dist/app.js',
      instances: 1,
      exec_mode: "fork",
    }
  ]
};

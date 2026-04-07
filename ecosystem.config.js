module.exports = {
  apps: [{
    name: 'curassist',
    script: 'dist/entry.js',
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};

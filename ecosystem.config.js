module.exports = {
  apps: [
    {
      name: 'medmap-backend-staging',
      script: 'build/server.js',
      env: {
        NODE_ENV: 'staging',
      },
    },
    {
      name: 'medmap-backend-production',
      script: 'build/server.js',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}

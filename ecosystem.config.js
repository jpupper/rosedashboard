module.exports = {
  apps: [{
    name: 'rose-dashboard-api',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3343,
      MONGODB_URI: 'mongodb://localhost:27017/rosedashboard',
      JWT_SECRET: 'your-production-secret-key'
    }
  }]
};

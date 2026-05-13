module.exports = {
  apps: [
    {
      name: 'mec-backend',
      script: './server.js',
      instances: 1, // Use single instance for Render (cluster mode not recommended on Render)
      exec_mode: 'fork',
      autorestart: true,
      watch: false, // Don't watch in production to save CPU/Memory
      max_memory_restart: '400M', // Prevents 512M limit OOM kills on free-tier Render/Railway
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      // Error handling & Logging
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true,
      time: true,
      // Graceful Shutdown
      kill_timeout: 10000,
      wait_ready: true,
      listen_timeout: 8000,
      // Render-specific settings
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
    },
  ],
};

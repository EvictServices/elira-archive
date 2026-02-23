module.exports = {
  apps: [
    {
      name: 'elira',
      script: 'npx',
      args: 'serve -l 3000',
      cwd: '/root/elira',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '200M',
      min_uptime: '10s',
      max_restarts: 10,
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      },
      error_file: '~/.pm2/logs/elira-error.log',
      out_file: '~/.pm2/logs/elira-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      combine_logs: true,
      merge_logs: true
    }
  ]
};

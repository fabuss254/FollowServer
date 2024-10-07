module.exports = {
    apps : [{
      script: 'server.js',
      watch: '.',
      env_production: {
        "PORT": 80,
        "NODE_ENV": "production",
      }
    }],
  
    deploy : {
      production : {
        user : 'ubuntu',
        host : '51.44.1.236',
        ref  : 'origin/main',
        repo : 'https://github.com/fabuss254/FollowServer.git',
        path : '/home/ubuntu/Server',
        'post-deploy' : 'npm install & pm2 startOrRestart ecosystem.config.js --env production',
      }
    }
  };
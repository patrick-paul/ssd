module.exports = {
  apps: [
    {
      name: "swahili spam detection",              
      script: "/home/ssd/.venv/bin/gunicorn", 
      args: "app:app -b 127.0.0.1:2001 -w 3",
      interpreter: "/home/ssd/.venv/bin/python",
      cwd: "/home/ssd",      
      watch: false,                     
      log_file: "/home/ssd/logs/app.log", 
      out_file: "/home/ssd/logs/app_out.log",
      error_file: "/home/ssd/logs/app_error.log", 
      env: {
        FLASK_ENV: "production",        
      },
      instances: 1,                     
      exec_mode: "fork",               
    }
  ]
};
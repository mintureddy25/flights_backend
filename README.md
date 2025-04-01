# Project Setup

## Clone the Repository
1. Open a terminal.
2. Clone the repository using:
   ```sh
   git clone https://github.com/mintureddy25/flights_backend
   ```
3. Navigate into the cloned directory:
   ```sh
   cd flights_backend
   ```

## Install Dependencies
1. Install the necessary Node.js dependencies:
   ```sh
   npm install
   ```
2. Ensure all required packages are installed successfully.

## Environment Variables
1. Refer to the `.env.example` file for the required environment variables.
2. Create a `.env` file and configure it accordingly.

## Database Schema
![Database Schema](https://toleram.s3.ap-south-1.amazonaws.com/toleram/supabase-schema-jzrisvwferxhpijyiqcr.png)

## Backend Information
- The backend is running at: [https://api.saiteja.online](https://api.saiteja.online)
- API documentation is available at: [https://api.saiteja.online/api-docs](https://api.saiteja.online/api-docs) (Swagger UI)
- The booking APIs are implemented using Supabase's built-in functions.
- Additional APIs are implemented using Node.js.

## Email Notification Service (Step-by-Step Setup)
### 1. Install Dependencies
   ```sh
   pip install -r requirements.txt
   ```
### 2. Configure Redis
   - Ensure Redis is installed and running.
   - Configure Redis connection settings in `.env`.
### 3. How the Email Service Works
   - The backend server will create and add email-sending jobs into a Redis queue whenever a new booking is made.
   - The `emailSender.py` script, running as a systemd custom service on an AWS server, continuously monitors the queue for new jobs.
   - When a new job is detected, the script processes it and sends the email to the respective user.
### 4. Running the Email Sender Script as a Systemd Service
   - Create a systemd service file `/etc/systemd/system/emailSender.service` with the following content:
     ```ini
     [Unit]
     Description=Email Sender Service
     After=network.target
     
     [Service]
     ExecStart=/usr/bin/python3 /path/to/emailSender.py
     WorkingDirectory=/path/to/project
     Restart=always
     User=youruser
     
     [Install]
     WantedBy=multi-user.target
     ```
   - Enable and start the service:
     ```sh
     sudo systemctl daemon-reload
     sudo systemctl enable emailSender
     sudo systemctl start emailSender
     ```
   - Check the service logs:
     ```sh
     sudo journalctl -u emailSender -f
     ```

## Running the Project
1. Start the backend server using PM2:
   ```sh
   npm run start
   ```
2. Ensure Redis is running for the queue system.
3. The email sender script should be running as a systemd service.

## Deployment Setup
### 1. Nginx Configuration
To map the domain using Nginx, add the following configuration to `/etc/nginx/sites-available/default`:

```
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

2. Reload Nginx:
   ```sh
   sudo systemctl restart nginx
   ```

### 2. PM2 Setup
1. Install PM2 globally:
   ```sh
   npm install -g pm2
   ```
2. Start the application:
   ```sh
   pm2 start server.js --name my-app
   ```
3. Save the PM2 process list:
   ```sh
   pm2 save
   ```
4. Configure PM2 to restart on system boot:
   ```sh
   pm2 startup
   ```

### 3. SSL Setup with Certbot
1. Install Certbot:
   ```sh
   sudo apt install certbot python3-certbot-nginx
   ```
2. Generate an SSL certificate:
   ```sh
   sudo certbot --nginx -d yourdomain.com
   ```

## Notes
- Ensure all environment variables are correctly configured.
- Make sure Redis is running before starting the email sender service.


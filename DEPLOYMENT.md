# VPS Deployment & Production Guide for NextLoad LMS

This guide walks you through deploying the LMS application to any Linux VPS (Ubuntu / Debian) using Docker and Docker Compose.

---

## 1. Prerequisites on Your VPS

- **Operating System:** Ubuntu 22.04 LTS or 24.04 LTS (recommended) / Debian 12
- **Hardware:**
  - Minimum: 2 GB RAM + 2 GB Swap (1 vCPU)
  - Recommended: 4 GB RAM (2 vCPU) for fast builds
- **Domain Name:** DNS `A` record pointing to your VPS IP address (e.g. `lms.yourdomain.com` &rarr; `123.45.67.89`)

---

## 2. Install Docker & Docker Compose on VPS

Run this one-liner on your fresh Ubuntu/Debian VPS to install official Docker:

```bash
# Update and install dependencies
sudo apt-get update && sudo apt-get install -y ca-certificates curl gnupg

# Add Docker's official GPG key & repository
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker engine and compose plugin
sudo apt-get update && sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Enable and start Docker service
sudo systemctl enable --now docker

# Optional: Allow running docker without sudo
sudo usermod -aG docker $USER
newgrp docker
```

---

## 3. GitHub Preparation & Cloning to VPS

### Step 3.1: Commit and Push from Your Local Machine
Ensure `.env` is **NOT** pushed to GitHub (it is already in `.gitignore` and `.dockerignore`):

```bash
git status
git add Dockerfile docker-compose.yml .dockerignore deploy.sh next.config.ts app/api/health DEPLOYMENT.md
git commit -m "feat: add production dockerization and deployment setup"
git push origin <your-branch>
```

### Step 3.2: Clone Repository on VPS
SSH into your VPS and clone the project:

```bash
cd /opt # or /var/www or your home directory
git clone <YOUR_GITHUB_REPO_URL> lms
cd lms
```

---

## 4. Configure Production Environment Variables

Copy the template and configure your production credentials:

```bash
cp .env.example .env
nano .env # or vim .env
```

### Essential Production Variables to Update:
```env
# 1. URLs (Use your actual live domain with https)
NEXT_PUBLIC_APP_URL=https://lms.yourdomain.com
BETTER_AUTH_URL=https://lms.yourdomain.com

# 2. Database (MongoDB Atlas URI)
DATABASE_URL=mongodb+srv://<user>:<password>@cluster0.mongodb.net/nextload?retryWrites=true&w=majority

# 3. Security Keys (Generate strong 64-character random strings)
# Generate with: openssl rand -hex 32
PAYLOAD_SECRET=your-64-character-random-hex-string
BETTER_AUTH_SECRET=your-64-character-random-hex-string

# 4. Payment Gateway (Production bKash credentials & callback)
BKASH_BASE_URL=https://tokenized.pay.bka.sh/v1.2.0-beta
BKASH_USERNAME=your-prod-username
BKASH_PASSWORD=your-prod-password
BKASH_APP_KEY=your-prod-app-key
BKASH_APP_SECRET=your-prod-app-secret
BKASH_CALLBACK_URL=https://lms.yourdomain.com/api/checkout/bkash/callback

# 5. Cloudinary & Email & SMS credentials
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

## 5. Build and Launch the Application

Build the production multi-stage image and launch the container in the background:

```bash
docker compose up -d --build
```

### Check Status & Logs:
```bash
# Check running containers
docker compose ps

# View live application logs
docker compose logs -f app

# Test health check directly from VPS terminal
curl http://localhost:3000/api/health
# Output: {"status":"ok","uptime":...,"timestamp":"..."}
```

---

## 6. Configure Nginx Reverse Proxy with Free SSL (Let's Encrypt)

To serve your application over standard port 80/443 with HTTPS:

### Step 6.1: Install Nginx & Certbot
```bash
sudo apt-get install -y nginx certbot python3-certbot-nginx
```

### Step 6.2: Create Nginx Site Configuration
```bash
sudo nano /etc/nginx/sites-available/lms.conf
```

Paste the following configuration (replace `lms.yourdomain.com` with your real domain):

```nginx
server {
    server_name lms.yourdomain.com;

    # Allow large lecture slides and PDF uploads up to 100MB
    client_max_body_size 100M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;

        # WebSocket support for Next.js live updates & subscriptions
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';

        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts for heavy Payload file transfers
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

### Step 6.3: Enable Site & Obtain SSL Certificate
```bash
# Enable site configuration
sudo ln -s /etc/nginx/sites-available/lms.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx syntax
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Automatically obtain and install free SSL certificate
sudo certbot --nginx -d lms.yourdomain.com
```

Certbot will automatically configure HTTPS, HTTP-to-HTTPS redirect, and setup auto-renewal cron jobs!

---

## 7. How to Update Application (CI/CD / Routine Updates)

Whenever you push new code to GitHub, simply run the included `deploy.sh` script on your VPS:

```bash
chmod +x deploy.sh
./deploy.sh
```

Or run manually:
```bash
git pull origin main
docker compose build --pull app
docker compose up -d --remove-orphans app
docker image prune -f
```

---

## 8. Useful Docker Management Commands

| Action | Command |
| :--- | :--- |
| **View logs** | `docker compose logs -f app` |
| **Restart application** | `docker compose restart app` |
| **Stop application** | `docker compose down` |
| **Execute bash inside container** | `docker compose exec app sh` |
| **Check disk space of Docker** | `docker system df` |
| **Clean unused images & build cache** | `docker system prune -af` |


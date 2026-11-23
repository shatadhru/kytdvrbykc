# Deploying NextLoad LMS to VPS via Coolify

This guide provides a step-by-step walkthrough to deploy the LMS application to your VPS using **Coolify**.

---

## 1. Verified Infrastructure Overview

Your Hostinger VPS is pre-configured and live:
- **VPS Hostname:** `srv2094876.hstgr.cloud`
- **Server IP:** `31.97.190.84`
- **Operating System:** Ubuntu 24.04 LTS with Coolify pre-installed
- **Coolify Web Dashboard:** [http://31.97.190.84:8000](http://31.97.190.84:8000)
- **Domain:** `delowarsir.io` / `www.delowarsir.io` (DNS A-record already points to `31.97.190.84`)
- **GitHub Repository:** `https://github.com/sadia-54/kytdvrbykc` (branch: `main`)

---

## 2. Option A: Deploy as a Git Application (Recommended)

This is the standard and cleanest Coolify deployment method. Coolify will build the app directly from your GitHub repository using the optimized multi-stage `Dockerfile`.

### Step 1: Access Coolify Dashboard
1. Open [http://31.97.190.84:8000](http://31.97.190.84:8000) in your browser.
2. Sign in to your Coolify account.

### Step 2: Create a New Project & Resource
1. Click **Projects** in the left sidebar and select or create a project (e.g. `NextLoad LMS`).
2. Click **+ New Resource**.
3. Select **Public Repository** (or **GitHub App** if you have connected your private GitHub account).
4. Enter your repository URL:
   ```text
   https://github.com/sadia-54/kytdvrbykc
   ```
5. Set branch to `main`.
6. Coolify will detect the repository. Select **Dockerfile** as the Build Pack.

### Step 3: Configure Application Settings
In the newly created application overview:
- **Name:** `lms-app`
- **Build Pack:** `Dockerfile`
- **Port:** `3000`
- **Domains:**
  ```text
  https://delowarsir.io, https://www.delowarsir.io
  ```
  *(Coolify will automatically configure Traefik / Caddy reverse proxy and provision free Let's Encrypt SSL certificates)*

### Step 4: Configure Persistent Volumes (Storage)
To ensure the SQLite question bank and local media persist across redeployments:
1. Go to the **Storages** tab in the application settings.
2. Add the following volume mounts:
   - **Storage 1:**
     - **Name:** `lms_data`
     - **Mount Path:** `/app/data`
   - **Storage 2:**
     - **Name:** `lms_media`
     - **Mount Path:** `/app/media`

### Step 5: Configure Environment Variables
Go to the **Environment Variables** tab and paste your production variables:

```env
# Server & Next.js
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
NEXT_TELEMETRY_DISABLED=1

# Production URLs (Check "Build Variable" for NEXT_PUBLIC_APP_URL & BETTER_AUTH_URL)
NEXT_PUBLIC_APP_URL=https://delowarsir.io
BETTER_AUTH_URL=https://delowarsir.io

# Database (MongoDB Atlas URI or Coolify MongoDB)
DATABASE_URL=mongodb+srv://<user>:<password>@cluster0.mongodb.net/nextload?retryWrites=true&w=majority

# Security Secrets (Generate 64-char random string via: openssl rand -hex 32)
PAYLOAD_SECRET=your-64-character-random-hex-string
BETTER_AUTH_SECRET=your-64-character-random-hex-string

# Cloudinary CDN (Check "Build Variable" for NEXT_PUBLIC_* variables)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dccbp4dpb
NEXT_PUBLIC_CLOUDINARY_API_KEY=433195912561124
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# SMTP Email Settings
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=support@delowarsir.io
SMTP_PASS=your-smtp-password
SMTP_FROM="Delowar Sir LMS <support@delowarsir.io>"

# Payment Gateways (bKash Production)
BKASH_BASE_URL=https://tokenized.pay.bka.sh/v1.2.0-beta
BKASH_USERNAME=your-bkash-username
BKASH_PASSWORD=your-bkash-password
BKASH_APP_KEY=your-bkash-app-key
BKASH_APP_SECRET=your-bkash-app-secret
BKASH_CALLBACK_URL=https://delowarsir.io/api/checkout/bkash/callback

# Nagad Manual Account Settings
NEXT_PUBLIC_NAGAD_NUMBER=01XXXXXXXXX
NEXT_PUBLIC_NAGAD_TYPE=Personal
```

> [!IMPORTANT]
> In Coolify, check the **"Build Variable"** box next to any variable prefixed with `NEXT_PUBLIC_` so Next.js can embed them during `pnpm build`.

### Step 6: Health Check Configuration
In the **Health Check** tab:
- **Path:** `/api/health`
- **Interval:** `30`
- **Timeout:** `5`
- **Retries:** `3`
- **Start Period:** `30`

### Step 7: Deploy
Click **Deploy**!
Coolify will:
1. Clone `https://github.com/sadia-54/kytdvrbykc`
2. Run multi-stage Docker build with pnpm 10.33 and Next.js standalone output
3. Start the container on port 3000
4. Automatically obtain Let's Encrypt SSL certificate
5. Route `https://delowarsir.io` to your app

---

## 3. Option B: Deploy as a Docker Compose Stack in Coolify

If you also want MongoDB to run directly on the VPS instead of MongoDB Atlas:

1. In Coolify, go to **Projects** &rarr; **+ New Resource** &rarr; **Docker Compose**.
2. Select **From Git Repository** and enter `https://github.com/sadia-54/kytdvrbykc`.
3. In the compose file input, point to `docker-compose.coolify.yml` (or paste the contents of `docker-compose.coolify.yml`).
4. Set the domains to `https://delowarsir.io, https://www.delowarsir.io`.
5. Enter the environment variables in the **Environment Variables** tab.
6. Click **Deploy**.

---

## 4. Verification & Testing

Once deployment finishes in Coolify:

1. **Verify Health Endpoint:**
   ```bash
   curl -I https://delowarsir.io/api/health
   # Expected: HTTP/2 200 OK
   ```

2. **Verify Admin Panel:**
   Visit `https://delowarsir.io/admin` to access Payload CMS admin.

3. **Verify Auth & Student Portal:**
   Visit `https://delowarsir.io/login` and `https://delowarsir.io/dashboard`.

# Deployment — MongoDB Architecture

## Stack

- **Server**: Node/Express (TypeScript → `dist/`)
- **Database**: MongoDB Atlas (free M0 cluster, `curassist` database in prod, `curassist-dev` in dev)
- **ODM**: Mongoose
- **Process manager**: PM2 with `ecosystem.config.js`
- **Hosting**: AWS EC2 t3.micro (us-east-1)
- **Reverse proxy**: Nginx with Let's Encrypt SSL
- **CI/CD**: GitHub Actions — auto-deploys to EC2 on push to `production`

---

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `development` | Active development — all work happens here |
| `staging` | Pre-production testing — merge from `development` to test |
| `production` | Live deployment — merge from `staging` to deploy to EC2 |
| `main` | Legacy — no longer used for deployment |

Workflow: `development` → `staging` (test) → `production` (deploy)

---

## Environment Variables

Two env files live on the server at `.env/.env.production` (gitignored):

```
NODE_ENV=production
SERVER_PORT=5555
BASE_URL=https://sfsgcurassist.com
WINSTON_LOG_LEVEL=info
DB_CONNECT=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/curassist?retryWrites=true&w=majority
```

`NODE_ENV=production` is also set explicitly by PM2 via `ecosystem.config.js` before the app starts, which tells `env-module.ts` which `.env` file to load.

---

## MongoDB Atlas Setup

- Cluster: existing free M0 cluster (`nodeexpressprojects.fctmvi1.mongodb.net`)
- Database (prod): `curassist` — created automatically on first Mongoose write
- Database (dev): `curassist-dev` — created automatically on first Mongoose write
- Network Access: whitelist EC2 instance IP in Atlas → Network Access
- Database user: `sjf_db_user` with read/write access

---

## EC2 Setup

### Instance
- AMI: Amazon Linux 2023
- Instance type: t3.micro
- Region: us-east-1
- Security group: ports 22 (SSH), 80 (HTTP), 443 (HTTPS)
- Elastic IP assigned

### Node via nvm
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

### Deploy app
```bash
git clone <repo-url> ~/CurAssist
cd ~/CurAssist
git checkout production
npm install
npm run build
```

### Environment files
```bash
mkdir .env
# Create .env/.env.production with required vars (see above)
```

### PM2
```bash
npm install -g pm2
pm2 start ecosystem.config.js --env production
pm2 startup    # follow the printed command to enable auto-start on reboot
pm2 save
```

### Nginx + HTTPS
```bash
sudo dnf install nginx certbot python3-certbot-nginx -y
# Configure Nginx to proxy port 443 → localhost:5555
sudo certbot --nginx -d sfsgcurassist.com
```

---

## Redeploy Process

Handled automatically by GitHub Actions on push to `production`:

```bash
git pull origin production
npm install
npm run build
pm2 restart curassist
```

---

## CI/CD

Configured in `.github/workflows/deploy.yml`. On push to `production`:
1. SSH into EC2
2. `git pull origin production`, `npm install`, `npm run build`
3. `pm2 restart curassist`

PM2 preserves `NODE_ENV=production` across restarts via `ecosystem.config.js`.

---

## EC2 Server — Switch to Production Branch

If the EC2 server is still tracking `main`, SSH in and switch:

```bash
cd ~/CurAssist
git fetch origin
git checkout production
git pull origin production
npm install
npm run build
pm2 restart curassist
```

---

## Notes

- No S3 bucket needed — MongoDB Atlas handles data persistence and durability
- No file-based storage — `content/Buckets/` directory is no longer used in production
- Atlas free tier handles backups automatically
- `main` branch is no longer used for deployment — all deploys go through `production`

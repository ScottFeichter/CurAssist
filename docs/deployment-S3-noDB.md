# Deployment Planning Notes
_Discussion date: July 16, 2025_

## App Profile
- Node/Express server (TypeScript → `dist/`)
- Serves static frontend files
- File-based storage — reads/writes HTML files to `content/Buckets/` on disk
- No external database
- Up to ~10 simultaneous volunteer users

## Concurrency Strategy

### Option A — Workflow convention (current plan)
Assign each volunteer to a different bucket. Collisions become nearly impossible by policy rather than code. Zero engineering cost.

Risk: someone works in the wrong bucket, or two volunteers are accidentally assigned the same one.

### Option B — File-level soft locking (deferred)
When a user opens a file, server marks it "checked out" in an in-memory map or `.lock` sidecar file. Other users see it as locked. Also consider optimistic concurrency (embed a version/timestamp in the file on load, reject saves where version doesn't match disk).

**Decision: ship with Option A, add Option B later.**

---

## Hosting Options Evaluated

### Ruled out
- **Cloudflare Pages/Workers** — serverless/edge only, no persistent disk, no long-running Node process. Would require major rewrite.
- **Vercel / Netlify** — same problem, built for static sites or serverless functions. File writes won't persist.
- **Render free tier** — spins down after 15 min inactivity, cold starts are bad UX for volunteers.
- **AWS App Runner / Elastic Beanstalk** — file writes don't persist across deploys without EFS attached (~$3+/mo extra). More complexity than needed.

### Viable options

| Provider | Always-on | Persistent disk | Est. cost |
|---|---|---|---|
| **Fly.io** | Yes (3 free VMs) | Yes (3GB free) | **$0–3/mo** |
| **Railway** | Yes | Yes (~$0.25/GB) | ~$6–8/mo |
| **AWS EC2 t3.micro** | Yes | Yes | $0 (12mo free tier) then ~$10/mo |
| **Render paid** | Yes | Paid add-on | ~$7/mo |

---

## Hosting Decision: AWS EC2 t3.micro

No containerization — plain Linux box running Node directly via PM2.

- ~$10/mo (free for 12 months if account qualifies for free tier)
- Simple, reliable, no orchestration overhead
- EBS root volume provides persistent disk storage

---

## Storage: EBS + S3 Backup

### EBS root volume (Option 1)
Every EC2 instance comes with an EBS root volume attached by default. `content/Buckets/` lives on this volume and persists across reboots and stops.

**Critical setting at launch**: uncheck **"Delete on termination"** for the root EBS volume. This ensures the volume survives if the instance is terminated, and can be reattached to a new instance.

- Survives: reboots, stops, instance replacement
- Does not survive: volume deletion (hence the S3 backup below)

### S3 sync cron (Option 3)
Nightly (or more frequent) cron job syncs `content/Buckets/` to an S3 bucket as a safety net.

```bash
# Add to crontab (crontab -e) — runs every 15 minutes
*/15 * * * * aws s3 sync /path/to/app/content/Buckets s3://curassist-backups/Buckets
```

To restore after spinning up a new instance:
```bash
aws s3 sync s3://curassist-backups/Buckets /path/to/app/content/Buckets
```

---

## Setup Steps

### 1. Launch EC2 instance
- AMI: Amazon Linux 2023 (or Ubuntu 22.04)
- Instance type: t3.micro
- Security group: open port 22 (SSH), 80 (HTTP), 443 (HTTPS)
- **Uncheck "Delete on termination" on root EBS volume**
- Assign or allocate an Elastic IP

### 2. Install Node via nvm
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

### 3. Deploy app
```bash
# Clone repo or scp files up
git clone <repo-url> /home/ec2-user/curassist
cd /home/ec2-user/curassist
npm install
npm run build
```

### 4. Configure environment
```bash
cp .env.example .env   # or create .env manually
# Set PORT=8004 (or 80 if running directly on port 80)
```

### 5. Run with PM2
```bash
npm install -g pm2
pm2 start dist/entry.js --name curassist
pm2 startup    # follow the printed command to enable auto-start on reboot
pm2 save
```

### 6. HTTPS with Let's Encrypt
```bash
# Amazon Linux
sudo dnf install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
```

### 7. S3 backup cron
```bash
# Ensure instance has an IAM role with s3:PutObject on the backup bucket
crontab -e
# Add: */15 * * * * aws s3 sync /home/ec2-user/curassist/content/Buckets s3://curassist-backups/Buckets
```

---

## Redeploy Process
```bash
cd /home/ec2-user/curassist
git pull
npm install
npm run build
pm2 restart curassist
```

`content/Buckets/` is never touched by a redeploy as long as you don't wipe the directory.


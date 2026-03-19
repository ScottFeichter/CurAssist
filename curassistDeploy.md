# CurAssist Deployment Log
_Deployed: March 16, 2026_

## Quick Reference

```bash
# SSH into EC2
ssh -i ~/.ssh/curassist-key.pem ec2-user@54.197.109.5

# View app console logs (run on EC2)
pm2 logs curassist
```

## Instance Specs

| Spec | Value |
|---|---|
| Instance type | t3.micro |
| vCPU | 2 |
| RAM | 1 GB |
| Storage | 20 GB gp3 EBS (delete on termination: false) |
| Architecture | x86_64 |
| OS | Amazon Linux 2023 |
| Kernel | 6.18 |
| AMI | ami-0c421724a94bba6d6 (al2023-ami-2023.10.20260302.1) |
| Virtualization | HVM |

---

## Infrastructure Summary

| Resource | Value |
|---|---|
| Provider | AWS |
| Region | us-east-1 |
| Instance | EC2 t3.micro |
| Instance ID | i-0af1c43da4bab3b6c |
| Elastic IP | 54.197.109.5 |
| Domain | sfsgcurassist.com |
| OS | Amazon Linux 2023 |
| Node | v20.3.1 |
| Process Manager | PM2 |
| Web Server | Nginx (reverse proxy) |
| SSL | Let's Encrypt (certbot) |

---

## Step 1 — Key Pair

Created a new EC2 key pair scoped to this app only. The `.pem` file lives locally at `~/.ssh/` and is never committed to the repo.

```bash
aws ec2 create-key-pair \
  --region us-east-1 \
  --key-name curassist-key \
  --query 'KeyMaterial' \
  --output text > ~/.ssh/curassist-key.pem

chmod 400 ~/.ssh/curassist-key.pem
```

- **Key pair name**: `curassist-key`
- **Local path**: `~/.ssh/curassist-key.pem`

---

## Step 2 — Security Group

Created a security group in the default VPC (`vpc-09e421b7aa98aebe9`) and opened ports 22, 80, and 443.

```bash
aws ec2 create-security-group \
  --region us-east-1 \
  --group-name curassist-sg \
  --description "CurAssist security group"

aws ec2 authorize-security-group-ingress \
  --region us-east-1 \
  --group-id sg-062d0a622560b869f \
  --ip-permissions \
    IpProtocol=tcp,FromPort=22,ToPort=22,IpRanges=[{CidrIp=0.0.0.0/0}] \
    IpProtocol=tcp,FromPort=80,ToPort=80,IpRanges=[{CidrIp=0.0.0.0/0}] \
    IpProtocol=tcp,FromPort=443,ToPort=443,IpRanges=[{CidrIp=0.0.0.0/0}]
```

- **Security group name**: `curassist-sg`
- **Security group ID**: `sg-062d0a622560b869f`

---

## Step 3 — EC2 Instance

Launched a t3.micro with Amazon Linux 2023. EBS root volume set to **not delete on termination** so data survives if the instance is terminated.

```bash
aws ec2 run-instances \
  --region us-east-1 \
  --image-id ami-0c421724a94bba6d6 \
  --instance-type t3.micro \
  --key-name curassist-key \
  --security-group-ids sg-062d0a622560b869f \
  --block-device-mappings '[{"DeviceName":"/dev/xvda","Ebs":{"DeleteOnTermination":false,"VolumeSize":20,"VolumeType":"gp3"}}]' \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=curassist}]' \
  --count 1
```

- **Instance ID**: `i-0af1c43da4bab3b6c`
- **AMI**: `ami-0c421724a94bba6d6` (Amazon Linux 2023)
- **EBS**: 20GB gp3, delete on termination = false

---

## Step 4 — Elastic IP

Allocated a static IP and associated it with the instance so the IP never changes across reboots.

```bash
aws ec2 allocate-address --region us-east-1 --domain vpc

aws ec2 associate-address \
  --region us-east-1 \
  --instance-id i-0af1c43da4bab3b6c \
  --allocation-id eipalloc-03b1fecd39791d6fe
```

- **Elastic IP**: `54.197.109.5`
- **Allocation ID**: `eipalloc-03b1fecd39791d6fe`

---

## Step 5 — Route 53 DNS

Added A records for both root domain and www subdomain pointing to the Elastic IP.

```bash
# Root domain
aws route53 change-resource-record-sets \
  --hosted-zone-id Z10211763RJIIH9LK0VEC \
  --change-batch '{
    "Changes": [{
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "sfsgcurassist.com",
        "Type": "A",
        "TTL": 300,
        "ResourceRecords": [{"Value": "54.197.109.5"}]
      }
    }]
  }'

# www subdomain
aws route53 change-resource-record-sets \
  --hosted-zone-id Z10211763RJIIH9LK0VEC \
  --change-batch '{
    "Changes": [{
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "www.sfsgcurassist.com",
        "Type": "A",
        "TTL": 300,
        "ResourceRecords": [{"Value": "54.197.109.5"}]
      }
    }]
  }'
```

- **Hosted zone ID**: `Z10211763RJIIH9LK0VEC`

---

## Step 6 — Server Setup (SSH)

SSH into the instance:

```bash
ssh -i ~/.ssh/curassist-key.pem ec2-user@54.197.109.5
```

Install git:

```bash
sudo dnf install git -y
```

Install nvm and Node 20.3:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20.3
nvm use 20.3
```

Install PM2:

```bash
npm install -g pm2
```

---

## Step 7 — Deploy App

Clone the repo:

```bash
git clone https://github.com/ScottFeichter/CurAssist.git
cd CurAssist
```

Install dependencies and build:

```bash
npm install
npm run build
```

Create the env directory and production env file:

```bash
mkdir ~/CurAssist/.env
nano ~/CurAssist/.env/.env.production
```

Contents of `.env.production`:

```
NODE_ENV=production
SERVER_PORT=8004
BASE_URL=http://sfsgcurassist.com/api

JWT_ACCESS_TOKEN_SECRET=<generated-secret>
JWT_REFRESH_TOKEN_SECRET=<generated-secret>
JWT_EXPIRES_IN=604800

WINSTON_LOG_LEVEL=info
SEQUELIZE_LOGGING=false
```

Generate secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Step 8 — PM2

Start the app and configure auto-start on reboot:

```bash
NODE_ENV=production pm2 start dist/entry.js --name curassist
pm2 startup   # copy and run the printed sudo command
pm2 save
```

Useful PM2 commands:

```bash
pm2 logs curassist       # tail logs
pm2 status               # check status
pm2 restart curassist    # restart app
```

---

## Step 9 — Nginx

Install and configure Nginx as a reverse proxy:

```bash
sudo dnf install nginx -y
sudo nano /etc/nginx/conf.d/curassist.conf
```

Contents of `curassist.conf`:

```nginx
server {
    listen 80;
    server_name sfsgcurassist.com www.sfsgcurassist.com;

    location / {
        proxy_pass http://localhost:8004;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## Step 10 — HTTPS (Let's Encrypt)

```bash
sudo dnf install certbot python3-certbot-nginx -y
sudo certbot --nginx -d sfsgcurassist.com -d www.sfsgcurassist.com
```

Certbot auto-renews. To test renewal:

```bash
sudo certbot renew --dry-run
```

---

## Step 11 — S3 Backup ✅

### S3 Bucket

```bash
aws s3 mb s3://curassist-backups --region us-east-1
```

- **Bucket**: `curassist-backups`

### IAM Role

Created an IAM role and instance profile so the EC2 instance can write to S3 without hardcoded credentials.

```bash
aws iam create-role \
  --role-name curassist-ec2-role \
  --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"ec2.amazonaws.com"},"Action":"sts:AssumeRole"}]}'

aws iam put-role-policy \
  --role-name curassist-ec2-role \
  --policy-name curassist-s3-backup \
  --policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":["s3:PutObject","s3:GetObject","s3:ListBucket","s3:DeleteObject"],"Resource":["arn:aws:s3:::curassist-backups","arn:aws:s3:::curassist-backups/*"]}]}'

aws iam create-instance-profile --instance-profile-name curassist-ec2-profile

aws iam add-role-to-instance-profile \
  --instance-profile-name curassist-ec2-profile \
  --role-name curassist-ec2-role

aws ec2 associate-iam-instance-profile \
  --region us-east-1 \
  --instance-id i-0af1c43da4bab3b6c \
  --iam-instance-profile Name=curassist-ec2-profile
```

- **IAM role**: `curassist-ec2-role`
- **Instance profile**: `curassist-ec2-profile`
- **Profile ARN**: `arn:aws:iam::588627308247:instance-profile/curassist-ec2-profile`

### Cron Job (on EC2 instance)

```bash
sudo dnf install cronie -y
sudo systemctl start crond
sudo systemctl enable crond
crontab -e
```

Add this line:

```
*/15 * * * * aws s3 sync /home/ec2-user/CurAssist/content/Buckets s3://curassist-backups/Buckets
```

### Restore from Backup

```bash
aws s3 sync s3://curassist-backups/Buckets /home/ec2-user/CurAssist/content/Buckets
```

---

## Step 12 — CI/CD via GitHub Actions ✅

On every push to `main`, GitHub Actions SSHes into the EC2 instance and runs the redeploy commands automatically.

### SSH Key for GitHub Actions

A separate ED25519 key pair was generated specifically for GitHub Actions (not the EC2 login key):

```bash
ssh-keygen -t ed25519 -f ~/.ssh/curassist-ed25519 -N "" -C "curassist-github-actions"
```

The public key was added to the EC2 instance's `authorized_keys`:

```bash
# On EC2 instance
echo "<public key contents>" >> ~/.ssh/authorized_keys
```

The private key was base64 encoded as a single line (no newlines) to avoid copy/paste formatting issues:

```bash
base64 -i ~/.ssh/curassist-ed25519 | tr -d '\n'
```

### GitHub Secrets

Added to repo under **Settings → Secrets and variables → Actions → Repository secrets**:

| Secret | Value |
|---|---|
| `EC2_HOST` | `54.197.109.5` — type manually, no trailing whitespace |
| `EC2_USER` | `ec2-user` — type manually, no trailing newline |
| `EC2_KEY` | base64-encoded ED25519 private key (single line) |

**Important**: `EC2_USER` must have no trailing newline — a hidden `\n` causes `Invalid user ec2-user\n` on the server and authentication fails silently.

### GitHub Actions Permissions

Set under **Settings → Actions → General → Workflow permissions**: **Read and write permissions**.

### Git Remote URL (on EC2)

GitHub requires a Personal Access Token (PAT) for HTTPS git operations. Set the remote URL with the PAT embedded:

```bash
cd ~/CurAssist
git remote set-url origin https://ScottFeichter:<PAT>@github.com/ScottFeichter/CurAssist.git
```

### Workflow File

Created at `.github/workflows/deploy.yml`. Uses plain `ssh` directly on the GitHub runner — no third-party actions, no Docker containers:

```yaml
name: Deploy to EC2

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Deploy
        env:
          DEPLOY_HOST: ${{ secrets.EC2_HOST }}
          DEPLOY_USER: ${{ secrets.EC2_USER }}
          DEPLOY_KEY: ${{ secrets.EC2_KEY }}
        run: |
          mkdir -p ~/.ssh
          echo "$DEPLOY_KEY" | base64 -d > ~/.ssh/deploy_key
          chmod 600 ~/.ssh/deploy_key
          ssh-keyscan -H "$DEPLOY_HOST" >> ~/.ssh/known_hosts
          ssh -i ~/.ssh/deploy_key "${DEPLOY_USER}@${DEPLOY_HOST}" "export NVM_DIR=\$HOME/.nvm && [ -s \$NVM_DIR/nvm.sh ] && . \$NVM_DIR/nvm.sh && cd ~/CurAssist && git pull origin main && npm install && npm run build && pm2 restart curassist"
```

To trigger a deploy: push to `main`. Monitor runs under the **Actions** tab in GitHub.

---

## Redeploy Process

```bash
cd ~/CurAssist
git pull
npm install
npm run build
pm2 restart curassist
```

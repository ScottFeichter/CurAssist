# SSH & Nginx — Connection and Reverse Proxy Guide

## What is SSH?

SSH (Secure Shell) is a protocol for securely connecting to a remote machine over an encrypted channel. We use it to log into the EC2 instance to run commands, edit config files, and troubleshoot — essentially a secure remote terminal session.

---

## SSH Key (PEM file)

### What is it?

A `.pem` file is a private key used for authentication instead of a password. When the EC2 instance was created, AWS generated a key pair — the public half lives on the server, the private half is the `.pem` file stored locally. Only someone with the private key can connect.

### Where is it?

```
~/.ssh/curassist-key.pem
```

This was found by listing `~/.ssh/*.pem`. It's also stored (base64-encoded) as a GitHub Actions secret (`EC2_KEY`) for CI/CD deploys.

### Permissions

The key must be read-only by the owner or SSH will refuse to use it:

```bash
chmod 600 ~/.ssh/curassist-key.pem
```

---

## Connecting to the EC2 Instance

### Connection details

| Field | Value |
|-------|-------|
| Host | `54.197.109.5` (Elastic IP, also resolves from `sfsgcurassist.com`) |
| User | `ec2-user` (default for Amazon Linux 2023) |
| Key | `~/.ssh/curassist-key.pem` |
| Instance ID | `i-0af1c43da4bab3b6c` |
| Region | `us-east-1` |

### How to connect

```bash
ssh -i ~/.ssh/curassist-key.pem ec2-user@54.197.109.5
```

Or using the domain:

```bash
ssh -i ~/.ssh/curassist-key.pem ec2-user@sfsgcurassist.com
```

### How the connection details were discovered

1. **Key** — found by listing `~/.ssh/*.pem`
2. **Host IP** — resolved from the production domain: `dig +short sfsgcurassist.com` → `54.197.109.5`
3. **User** — `ec2-user` is the default SSH user for Amazon Linux AMIs
4. **Deploy workflow** — `.github/workflows/deploy.yml` references `EC2_HOST`, `EC2_USER`, and `EC2_KEY` as GitHub secrets, confirming the pattern

### Troubleshooting connection issues

- **"Operation timed out"** — the instance is likely stopped. Start it from the AWS console or CLI:
  ```bash
  aws ec2 start-instances --instance-ids i-0af1c43da4bab3b6c --region us-east-1
  ```
  Wait ~30 seconds for it to reach "running" state.

- **"Permission denied (publickey)"** — wrong key or wrong user. Verify with `-v` flag for verbose output.

- **"Unprotected private key file"** — run `chmod 600 ~/.ssh/curassist-key.pem`

---

## What is Nginx?

Nginx is a reverse proxy server that sits between the internet and our Express app:

```
Internet → Nginx (ports 80/443) → Express (localhost:5555)
```

### Why we use it

- **SSL termination** — handles HTTPS certificates (Let's Encrypt) so Express doesn't have to
- **Security** — Express never binds to a public port directly; Nginx shields it
- **Static performance** — optimized for serving static assets and handling slow clients
- **Standard port binding** — ports 80/443 require root; Nginx runs as root, Express runs as a normal user

---

## Nginx Configuration

### Config file location

```
/etc/nginx/conf.d/curassist.conf
```

### Current config (after body size fix)

```nginx
server {
    server_name sfsgcurassist.com www.sfsgcurassist.com;
    client_max_body_size 50m;

    location / {
        proxy_pass http://localhost:5555;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/sfsgcurassist.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/sfsgcurassist.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    if ($host = www.sfsgcurassist.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    if ($host = sfsgcurassist.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    server_name sfsgcurassist.com www.sfsgcurassist.com;
    return 404; # managed by Certbot
}
```

### What each part does

- **First `server` block** — handles HTTPS (port 443), proxies to Express, terminates SSL
- **Second `server` block** — catches HTTP (port 80) and redirects to HTTPS
- **`proxy_pass`** — forwards requests to Express on localhost:5555
- **`proxy_set_header` lines** — preserves original request info (host, websocket upgrade)
- **`client_max_body_size 50m`** — allows request bodies up to 50MB (matches Express's `express.json({ limit: '50mb' })`)

---

## Adjusting the Body Size Limit

The effective request body limit is the **lowest** value in the chain:

```
Client → Nginx (client_max_body_size) → Express (json limit)
```

To change it, update **both** places:

### 1. Nginx (on EC2)

```bash
ssh -i ~/.ssh/curassist-key.pem ec2-user@54.197.109.5
sudo vi /etc/nginx/conf.d/curassist.conf
# Change: client_max_body_size 50m;  →  client_max_body_size <new_size>;
sudo nginx -t          # validate syntax
sudo systemctl reload nginx   # apply without downtime
```

### 2. Express (in codebase)

Find the line in the server setup:
```typescript
SERVER.use(express.json({ limit: '50mb' }));
```
Change `'50mb'` to match whatever you set in Nginx.

### Useful Nginx commands

| Command | Purpose |
|---------|---------|
| `sudo nginx -t` | Test config syntax (always run before reload) |
| `sudo systemctl reload nginx` | Apply config changes without dropping connections |
| `sudo systemctl restart nginx` | Full restart (brief downtime) |
| `sudo systemctl status nginx` | Check if Nginx is running |
| `sudo cat /var/log/nginx/error.log` | View Nginx error log |

---

## SSL Certificate Renewal

Let's Encrypt certs expire every 90 days. Certbot sets up auto-renewal via a systemd timer:

```bash
sudo systemctl list-timers | grep certbot   # verify timer is active
sudo certbot renew --dry-run                 # test renewal without changing anything
```

If auto-renewal fails, manually renew:
```bash
sudo certbot renew
sudo systemctl reload nginx
```

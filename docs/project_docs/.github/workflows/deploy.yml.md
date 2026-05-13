# .github/workflows/deploy.yml

This is the GitHub Actions CI/CD workflow that automatically deploys to the EC2 instance on every push to the `production` branch.

---

## Line-by-Line Breakdown

```yaml
name: Deploy to EC2
```
The workflow name — shows up in the GitHub Actions tab.

```yaml
on:
  push:
    branches:
      - production
```
Trigger: runs only when code is pushed to the `production` branch. Pushes to `development`, `staging`, or any other branch do NOT trigger deployment.

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
```
Runs on a fresh Ubuntu VM provided by GitHub. This is the CI runner — not our EC2 instance.

```yaml
    steps:
      - name: Deploy
        env:
          DEPLOY_HOST: ${{ secrets.EC2_HOST }}
          DEPLOY_USER: ${{ secrets.EC2_USER }}
          DEPLOY_KEY: ${{ secrets.EC2_KEY }}
```
Pulls connection details from GitHub repository secrets:
- `EC2_HOST` — the Elastic IP (`54.197.109.5`)
- `EC2_USER` — `ec2-user`
- `EC2_KEY` — the PEM private key (base64-encoded)

These are set in GitHub → Settings → Secrets and variables → Actions.

```yaml
        run: |
          mkdir -p ~/.ssh
          echo "$DEPLOY_KEY" | base64 -d > ~/.ssh/deploy_key
          chmod 600 ~/.ssh/deploy_key
          ssh-keyscan -H "$DEPLOY_HOST" >> ~/.ssh/known_hosts
```
SSH setup on the CI runner:
1. Creates `.ssh` directory
2. Decodes the base64-encoded PEM key and writes it to a file
3. Sets permissions to 600 (required by SSH)
4. Adds the EC2 host's fingerprint to known_hosts (prevents "unknown host" prompt)

```yaml
          ssh -i ~/.ssh/deploy_key "${DEPLOY_USER}@${DEPLOY_HOST}" "export NVM_DIR=\$HOME/.nvm && [ -s \$NVM_DIR/nvm.sh ] && . \$NVM_DIR/nvm.sh && cd ~/CurAssist && pm2 stop curassist || true && git pull origin production && npm install && npm run build && pm2 start ecosystem.config.js --env production"
```
SSHs into EC2 and runs the deploy sequence:
1. `export NVM_DIR=...` — loads nvm (Node Version Manager) so `node`/`npm` are available
2. `cd ~/CurAssist` — navigate to the project
3. `pm2 stop curassist || true` — stop the running server (|| true prevents failure if not running)
4. `git pull origin production` — pull latest code
5. `npm install` — install any new/updated dependencies
6. `npm run build` — compile TypeScript, build template, copy assets, generate docs
7. `pm2 start ecosystem.config.js --env production` — start the server with production env

---

## Deployment Flow

```
Developer merges to production branch
  → GitHub detects push
  → Spins up Ubuntu runner
  → SSHs into EC2
  → Pulls code, builds, restarts PM2
  → Server is live with new code (~30-60 seconds total)
```

---

## Troubleshooting

- **Deploy fails with "Connection refused"** — EC2 instance might be stopped
- **Deploy fails with "Permission denied"** — check that `EC2_KEY` secret is correct and base64-encoded
- **Build fails** — check `npm run build` locally first; the EC2 instance has limited RAM (1GB on t3.micro)

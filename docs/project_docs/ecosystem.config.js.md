# ecosystem.config.js

This is the PM2 process manager configuration. PM2 keeps the Node.js server running in production — restarts on crash, manages logs, and handles zero-downtime reloads.

---

## Line-by-Line Breakdown

```javascript
module.exports = {
```
Exports the config as a CommonJS module. PM2 reads this file directly with `require()`.

```javascript
  apps: [{
```
`apps` is an array of application definitions. We have one app. PM2 supports multiple apps in a single config (e.g. a worker process alongside the web server).

```javascript
    name: 'curassist',
```
The process name in PM2. Used for commands like `pm2 restart curassist`, `pm2 logs curassist`, `pm2 stop curassist`. Shows up in `pm2 list`.

```javascript
    script: 'dist/entry.js',
```
The file PM2 executes. Points to the compiled TypeScript output — the same file `npm start` runs. PM2 spawns a Node.js process with this as the entry point.

```javascript
    env_production: {
      NODE_ENV: 'production'
    }
```
Environment variables injected when started with `--env production`. When you run `pm2 start ecosystem.config.js --env production`, PM2 sets `process.env.NODE_ENV = 'production'` before the app starts. This is critical because `env-module.ts` uses `NODE_ENV` to determine which `.env` file to load (`.env/.env.production`).

```javascript
  }]
};
```
Closes the app definition and the module export.

---

## How It's Used

**Start in production:**
```bash
pm2 start ecosystem.config.js --env production
```

**Restart after deploy:**
```bash
pm2 restart curassist
```

**View logs:**
```bash
pm2 logs curassist
```

**Enable auto-start on server reboot:**
```bash
pm2 startup    # prints a command to run with sudo
pm2 save       # saves current process list
```

---

## Why PM2 Instead of Just `node dist/entry.js`

- **Auto-restart on crash** — if the process dies, PM2 brings it back immediately
- **Persists across reboots** — `pm2 startup` + `pm2 save` ensures the app starts on boot
- **Log management** — PM2 captures stdout/stderr and rotates logs
- **Zero-downtime reload** — `pm2 reload` starts a new process before killing the old one
- **Process monitoring** — `pm2 monit` shows CPU/memory usage in real time

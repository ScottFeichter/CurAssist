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

## Recommendation

**Fly.io** — best fit:
- Free tier covers always-on small VM + 3GB persistent volume (likely $0 cost)
- Auto HTTPS + custom domain included
- Single region deploy is fine for 10 volunteers
- Deploy via Docker container (straightforward for Node)

**AWS EC2 t3.micro** — good alternative if staying in AWS ecosystem, especially if the account qualifies for the 12-month free tier.

---

## Key Deploy Task (either provider)
`content/Buckets/` must live on the **persistent volume**, not the container image, so file changes survive redeploys. One-line config change when ready.

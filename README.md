# CurAssist - Curation Assistant

A browser-based application for reviewing and curating HTML form files for the SF Service Guide.

**Production URL**: https://sfsgcurassist.com

## Structure

```
CurAssist/
  src/
    entry.ts              # Server entry point
    server/               # Express server, routes, helpers
    public/
      frontend/           # Frontend static files (index.html, app.js, Scripts/)
        Scripts/          # submit/transform logic (submitNewOrg.js, submitService.js, etc.)
        requestSamples/   # Captured SF API request/response samples
  content/
    Buckets/              # HTML files organized by bucket/subdirectory
    Templates/            # Template files and build scripts
  logs/                   # Winston rotating log files (gitignored)
  dist/                   # Compiled output (gitignored)
  .env/                   # Environment files (gitignored)
    .env.development
    .env.production
    .env.testing
    .env.example
  .github/
    workflows/
      deploy.yml          # CI/CD — auto-deploys to EC2 on push to main
  package.json
  curassistDeploy.md      # Full deployment log and infrastructure notes
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
mkdir .env
cp .env/.env.example .env/.env.development
# Edit .env/.env.development with your values
```

Key env vars:
```
NODE_ENV=development
SERVER_PORT=8004
JWT_ACCESS_TOKEN_SECRET=<generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
JWT_REFRESH_TOKEN_SECRET=<generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
JWT_EXPIRES_IN=604800
```

## Running

**Development** (with auto-restart):
```bash
npm run dev
```

**Production**:
```bash
npm run build
NODE_ENV=production npm start
```

Then open browser to: `http://localhost:8004`

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Builds blank combined template, test values template, compiles TypeScript, copies views/public |
| `npm run dev` | Runs full build then starts dev runner |
| `npm start` | Starts production server from compiled output |
| `npm run watch` | Watches TypeScript files and recompiles on change |
| `npm run watch:template` | Watches `content/Templates` source files and rebuilds `orgServTemplate-combinedTestValues.html` on change. Run in a separate terminal while editing template source files |
| `npm run serve` | Runs nodemon on compiled server output |
| `npm run clean` | Removes `dist/` directory |

## Usage

1. Select a bucket from the dropdown (e.g., "DCYF 10.01.25")
2. Select a subdirectory ("Incomplete", "Pending", "Complete")
3. Review HTML forms in the content area
4. Adjust input values as needed
5. Use navigation buttons to move between files
6. Save changes with "Save Changes" button
7. Move files to different subdirectories using "Move To" dropdown
8. Submit completed files to SF Service Guide with "Submit" button

## File Organization

```
content/
  Buckets/
    [Bucket Name]/
      incomplete/    # Files to review
      pending/       # Files in progress
      complete/      # Reviewed and submitted files
```

## API Endpoints

### Buckets (internal)

- `GET /api/buckets` — List all buckets
- `GET /api/buckets/:bucket/subdirs` — List subdirectories in a bucket
- `GET /api/buckets/:bucket/:subdir/files` — List HTML files in a subdirectory
- `GET /api/buckets/:bucket/:subdir/:filename` — Get file content
- `POST /api/buckets/save` — Save file changes
- `POST /api/buckets/move` — Move file to different subdirectory
- `POST /api/buckets/create-file` — Create new file from template or copy of existing file
- `POST /api/buckets/create` — Create new bucket from spreadsheet upload
- `DELETE /api/buckets/delete` — Delete a file
- `DELETE /api/buckets/:bucket` — Delete an entire bucket

### SF Service Guide Proxy

All SF API calls are proxied through `/api/sf/*` to avoid CORS issues. The server forwards requests to `https://www.sfserviceguide.org/api/*`.

- `POST /api/sf/*` — Proxy any POST to the SF Service Guide API

## Deployment

Deployed on AWS EC2 t3.micro (us-east-1) with Nginx, PM2, and Let's Encrypt SSL.

CI/CD is configured via GitHub Actions — every push to `main` automatically deploys to the EC2 instance.

See `curassistDeploy.md` for full infrastructure details, resource IDs, and setup steps.

## SF Service Guide API

Base URL: `https://www.sfserviceguide.org/api`

All calls are made server-side via the `/api/sf/*` proxy. Required headers on all requests:
```
Content-Type: application/json
Accept: application/json
Origin: https://www.sfserviceguide.org
Referer: https://www.sfserviceguide.org/organizations/new
```

Authentication is cookie-based (session cookies from sfserviceguide.org). No API key is used — requests rely on the user's active browser session being forwarded.

### Endpoints Used

**Create Organization**
```
POST /api/resources
```
Payload:
```json
{
  "resources": [{
    "name": "Org Name",
    "addresses": [],
    "notes": [],
    "schedule": { "schedule_days": [] },
    "phones": []
  }]
}
```
Returns `201` with the new org object including `id`.

**Create Services for an Org**
```
POST /api/resources/:org_id/services
```
Payload:
```json
{
  "services": [{
    "id": -2,
    "name": "Service Name",
    "notes": [],
    "schedule": { "schedule_days": [] },
    "shouldInheritScheduleFromParent": true,
    "eligibilities": [],
    "categories": []
  }]
}
```
Returns `201` with created service objects including assigned `id`s.

**Update Organization (change request)**
```
POST /api/resources/:org_id/change_requests
```
Payload:
```json
{ "change_request": {} }
```
Returns `201` with change request object (`id`, `status: "pending"`, `field_changes`).

**Delete Service**
```
DELETE /api/services/:service_id
```
Returns `200 OK`.

**Get Organization (read)**
```
GET /api/v2/resources/:org_id
```
Note: read uses `v2` path; write endpoints use unversioned `/api`.

Returns `200` with full org object.

### Submit Flow

The submit flow (triggered by the "Submit" button) is handled in `src/public/frontend/Scripts/`:

1. `collector.js` — extracts form field values from the iframe DOM
2. `transform.js` — maps form data to SF API payload shape
3. `submitNewOrg.js` — POSTs org, then POSTs services if any
4. `submitService.js` — POSTs a standalone service to an existing org

Sample captured requests/responses are in `src/public/frontend/requestSamples/`.

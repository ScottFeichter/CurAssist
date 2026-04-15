# CurAssist - Curation Assistant

A browser-based application for reviewing and curating org records for the SF Service Guide. Records are stored in MongoDB Atlas and hydrated into the HTML template at request time.

**Production URL**: https://sfsgcurassist.com

## Structure

```
CurAssist/
  src/
    entry.ts              # Server entry point
    server/               # Express server, routes, helpers
    database/             # MongoDB models and Atlas connection
      atlas.ts            # Mongoose connect/disconnect
      models/
        org.model.ts      # Org document schema (with embedded services + history)
        bucket.model.ts   # Bucket document schema
    public/
      frontend/           # Frontend static files (index.html, app.js, Scripts/)
        Scripts/          # submit/transform/collector logic
        requestSamples/   # Captured SF API request/response samples
    tests/
      unit/               # Unit tests (sanitizers, transform logic)
      integration/        # Integration tests (API routes via supertest + mongodb-memory-server)
      _helpers/           # testConfig, testData, testUtils
  content/
    Templates/            # Combined HTML template and build scripts
  scripts/
    typedoc-runner.js     # TypeDoc wrapper with formatted output
  logs/                   # Winston rotating log files (gitignored)
  dist/                   # Compiled output (gitignored)
  .env/                   # Environment files (gitignored)
    .env.development
    .env.production
    .env.example
  .github/
    workflows/
      deploy.yml          # CI/CD — auto-deploys to EC2 on push to main
  ecosystem.config.js     # PM2 config — sets NODE_ENV=production
  typedoc.json            # TypeDoc config (entry point: src/entry.ts, output: docs/typedocs/)
  jest.config.json        # Jest config
  package.json
  docs/
    deployment-DB-noS3.md # Current MongoDB-based deployment notes
    deployment-S3-noDB.md # Original file-based deployment (historical reference)
    db2bOrNot2b.md        # Database migration decision log
    curassistDeployFirst.md # Full deployment log and infrastructure notes
    todo.md               # Todo list
    tests.md              # Test coverage documentation
    spreadsheet-data-flow.md # Internal: how spreadsheet columns map to org/spreadsheetService/services
    .sequelizerc          # Sequelize config (historical reference)
```

## Environment Variables

Environment variables are loaded at startup by `src/config/env-module.ts`:

1. `NODE_ENV` must be set before the app starts — in dev `dev-runner.js` explicitly sets it to `'development'`, in prod `ecosystem.config.js` sets it to `'production'` via PM2
2. `entry.ts` imports `requiredEnvVars` from `env-module.ts`, which triggers it to execute
3. `env-module.ts` builds the file path `./.env/.env.${NODE_ENV}` and calls `dotenv.config()` to load it into `process.env`
4. Required vars are validated — app exits if any are missing
5. Vars are exported as named constants for use throughout the app

Required vars:
```
NODE_ENV
SERVER_PORT
BASE_URL
WINSTON_LOG_LEVEL
DB_CONNECT
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
SERVER_PORT=5555
DB_CONNECT=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/curassist-dev?retryWrites=true&w=majority
WINSTON_LOG_LEVEL=debug
BASE_URL=http://localhost:5555
```

## Running

**Development** (with auto-restart):
```bash
npm run dev
```

**Production**:
```bash
npm run build
pm2 start ecosystem.config.js --env production
```

Then open browser to: `http://localhost:5555`

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Builds combined template, compiles TypeScript, copies views/public, generates TypeDoc |
| `npm run dev` | Runs full build then starts dev runner |
| `npm start` | Starts production server from compiled output |
| `npm run watch` | Watches TypeScript files and recompiles on change |
| `npm run watch:template` | Watches `content/Templates` source files and rebuilds combined template on change |
| `npm run serve` | Runs nodemon on compiled server output |
| `npm run docs` | Generates TypeDoc documentation to `docs/typedocs/` |
| `npm test` | Runs all tests |
| `npm run test:unit` | Runs unit tests only |
| `npm run test:integration` | Runs integration tests only |
| `npm run test:coverage` | Runs all tests with coverage report |
| `npm run clean` | Removes `dist/` directory |

## Usage

1. Select a bucket from the dropdown (e.g., "DCYF 10.01.25")
2. Select a subdirectory ("incomplete", "pending", "complete")
3. Review the org form in the content area — data is loaded from MongoDB Atlas
4. Adjust input values as needed
5. Save changes with "Save Changes" button — saves to Atlas record
6. Move files to different subdirectories using "Move File" button
7. Submit completed files to SF Service Guide with "Submit" button — writes sfId back to Atlas and moves to complete

## Data Architecture

All org records are stored in MongoDB Atlas. The HTML template (`orgServTemplate-combined.html`) is never stored pre-populated — it is hydrated with data from the DB at request time.

```
Atlas collections:
  orgs      — org documents with embedded services, history audit trail
  buckets   — bucket metadata (name, createdBy, timestamps)
```

Buckets and subdirectories are UI concepts backed by fields on the org document:
- `bucket` — the batch name (e.g. "DCYF 10.01.25")
- `status` — `incomplete` | `pending` | `complete` (replaces subdirectory folders)

Every save, move, and submit appends an entry to `org.history` for a full audit trail.

## API Endpoints

### Dev-Only Routes

Only available when `NODE_ENV=development`:

- `GET /test` — Dev test page with links to all endpoints and docs
- `GET /test/express` — Express routing test
- `GET /test/404` — 404 error handling test
- `GET /api/csrf/restore` — Restore CSRF token
- `GET /docs/typedocs` — TypeDoc API documentation (served as static HTML)
- `GET /docs/readme` — README.md
- `GET /docs/deployment` — Deployment guide (MongoDB)
- `GET /docs/deployment-nodb` — Deployment guide (S3, no DB, historical)
- `GET /docs/deploy-log` — Full deployment log and infrastructure notes
- `GET /docs/buckets-map` — Spreadsheet field maps
- `GET /docs/tests` — Test coverage documentation
- `GET /docs/spreadsheet-data-flow` — Spreadsheet import data flow (which fields go where)

### Info (all environments)

- `GET /docs/spreadsheet-format` — Spreadsheet column header guide for bucket creation

### Buckets (internal)

- `GET /api/buckets` — List all bucket names
- `GET /api/buckets/:bucket/subdirs` — Returns fixed `['incomplete','pending','complete']`
- `GET /api/buckets/:bucket/:subdir/files` — List orgs as `{_id, name}` objects
- `GET /api/buckets/:bucket/:subdir/:id` — Get hydrated template HTML for an org
- `POST /api/buckets/save` — Save org field values `{id, fields}` to Atlas
- `POST /api/buckets/move` — Move org to different bucket/subdirectory
- `POST /api/buckets/submit` — Write sfId back to Atlas, set status to complete
- `POST /api/buckets/create-file` — Create blank org or copy existing one
- `POST /api/buckets/import-file` — Direct import from SF org ID
- `POST /api/buckets/create-bucket-empty` — Create a named empty bucket
- `POST /api/buckets/create-bucket-spreadsheet` — Create new bucket from spreadsheet upload; returns import report as base64 xlsx
- `POST /api/buckets/create-bucket-spreadsheet-submit` — Create bucket from spreadsheet, return org list for browser-side SFSG submission; returns import report as base64 xlsx
- `POST /api/buckets/build-report` — Build combined import report from DB + SFSG results; returns xlsx as base64
- `DELETE /api/buckets/delete` — Delete a single org
- `DELETE /api/buckets/:bucket` — Delete entire bucket and all its orgs

### SF Service Guide Proxy

All SF API calls are proxied through `/api/sf/*` to avoid CORS issues. The server forwards requests to `https://www.sfserviceguide.org/api/*`.

- `POST /api/sf/*` — Proxy any POST to the SF Service Guide API

## Testing

Tests use Jest with `mongodb-memory-server` (in-memory MongoDB) and `supertest` (HTTP testing). Tests never touch Atlas or the running dev server.

```bash
npm test                  # run all tests
npm run test:unit         # unit tests only (sanitizers, transform logic, hydrateTemplate)
npm run test:integration  # integration tests only (API routes)
npm run test:coverage     # all tests with coverage report
```

**Test environment behavior:**
- `NODE_ENV=test` is set automatically by all test scripts
- Winston uses a silent transport — no log files written during tests
- Each integration test gets a fresh in-memory DB (cleared between tests)
- CSRF tokens are fetched via a real `GET /api/csrf/restore` call using a cookie-persisting agent

**First run on a new machine:** `mongodb-memory-server` downloads a MongoDB binary (~100MB) on first use. Subsequent runs use the cached binary.

## Deployment

Deployed on AWS EC2 t3.micro (us-east-1) with Nginx, PM2, and Let's Encrypt SSL.

CI/CD is configured via GitHub Actions — every push to `main` automatically deploys to the EC2 instance.

See `docs/deployment-DB-noS3.md` for the current MongoDB-based deployment. See `docs/deployment-S3-noDB.md` for the original file-based deployment (historical reference).

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

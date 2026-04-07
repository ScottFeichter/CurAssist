# db2bOrNot2b — Database Migration Decision Log

## Should we introduce a database at all?

### Initial hesitation
The 413 save error and bucket create timeout were the immediate pain points, not the storage format. Both were fixed without a database. The HTML files being "too heavy" was the original concern.

### Arguments for staying with files
- 413 fixed (Express body parser limit bumped to 10mb)
- Bucket create timeout fixed (removed timeout for create/import routes)
- Dev/prod mismatch solvable with Remote SSH
- Significant rewrite cost for a volunteer tool

### Arguments that tipped toward a database
- Import feature already proves the data model — org object with services, phones, locations, hours is a known shape
- One canonical HTML template is easier to maintain than N generated HTML files
- The import logic (SFSG API → app) and collector logic (app → SFSG API) are already half-built around a JSON object
- Querying across records becomes possible (e.g. all orgs missing categories/eligibilities)
- Lag in the app is likely Express parsing and serving large HTML files — fetching a lean JSON document and hydrating a single cached template will be faster
- The data arrives as JSON and leaves as JSON — storing it as a document goes with the grain

**Decision: introduce a database.**

---

## Postgres vs MongoDB

### Steel man: Postgres
The SFSG org schema is not unpredictable — orgs have phones, locations, hours, services, categories, eligibilities. That's a known stable shape defined by the SFSG API. Relational integrity means a service cannot exist without an org. Querying "all services missing categories" is a clean indexed query against a proper column. Postgres `jsonb` handles genuinely variable parts. It has been running production workloads for 30 years. On EC2 it's one package install — no external service, no Atlas account, no network dependency, no per-document size limits. Scales without architectural changes if the app ever grows.

### Steel man: MongoDB
Familiarity eliminates an entire category of bugs and delays — already known by the developer. The data arrives from SFSG as a JSON object and leaves to SFSG as a JSON object — storing it as a document goes with the grain, not against it. Mongoose gives schema enforcement in TypeScript with the same language already in use. The import logic already built maps directly onto a document insert. The collector logic maps directly onto a document read. No impedance mismatch — what comes in is what gets stored is what goes out. Embedded services mean one read to get everything needed to render a form, no joins. Null check queries for categories and eligibilities are straightforward. MongoDB Atlas free tier removes ops burden entirely — no installation, no backups to manage, just a connection string. No migrations needed — adding a field to the schema just returns `undefined` on existing documents until updated, which suits the optional nature of most org fields.

### Decision: MongoDB
The Postgres steel man is architecturally stronger in the abstract. The Mongo steel man wins in the concrete reality of this project. The data flow is document-shaped end to end. The developer knows the tool. Atlas removes ops overhead. The transform logic is already half-built.

---

## Document structure: embedded vs separate collections

### Option A — one `orgs` collection, services embedded as array inside org document
- Mirrors the SFSG API response shape exactly
- One read returns everything needed to render the form
- Can still query into nested arrays:
  ```js
  // Orgs with at least one service missing categories
  Org.find({ "services.categories": { $in: [null, []] } })

  // Using $elemMatch for complex conditions
  Org.find({ services: { $elemMatch: { categories: { $in: [null, []] } } } })
  ```

### Option B — two collections: `orgs` and `services`, services reference parent org by ID
- Better if services need to be queried and paginated independently of orgs
- Adds join-like complexity (populate)

### Decision: Option A
Services in SFSG are always fetched and submitted in the context of their org. No use case for paginating services independent of orgs.

---

## ORM vs ODM

Mongoose is the ODM equivalent of Sequelize (ORM). Same purpose — schema/model layer, validation, query abstraction, hooks, TypeScript support. The acronym difference reflects the underlying DB paradigm (relational tables vs documents), not a meaningful difference in what the tool does.

Key practical difference: Sequelize requires migrations because altering relational tables is destructive. Mongoose does not — adding a field to the schema just returns `undefined` on existing documents. This is an advantage for a schema where most fields are optional.

---

## Performance

Not a deciding factor at this scale. Mongo is faster for document reads (one query, no joins). Postgres is faster for complex relational aggregations. At the scale of a small volunteer team curating org records one at a time, both feel identical. The lag in the app is more likely Express parsing and serving large HTML files or network latency to us-east-1 — not the storage format.

---

## Final stack decision

- **Database**: MongoDB
- **Hosting**: MongoDB Atlas free tier
- **ODM**: Mongoose
- **Document structure**: single `orgs` collection with services embedded

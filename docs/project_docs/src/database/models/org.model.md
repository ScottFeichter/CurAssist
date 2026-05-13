# src/database/models/org.model.ts

This is the main data model for the application. It defines the Mongoose schema for org documents — the central entity that represents an organization being curated for the SF Service Guide.

---

## Overview

An org document contains:
- Organization metadata (name, email, website, description, etc.)
- Embedded services (array of service sub-documents)
- A spreadsheet service (optional — from spreadsheet imports)
- Addresses, phones, notes, schedule
- Bucket/status for UI organization
- History audit trail

---

## Line-by-Line Breakdown

### Imports

```typescript
import mongoose, { Schema, Document, Model } from 'mongoose';
```
- `mongoose` — the default export, used for `mongoose.model()`
- `Schema` — class for defining document structure and validation
- `Document` — TypeScript interface that Mongoose documents extend (adds `_id`, `save()`, etc.)
- `Model` — TypeScript generic for the model type (provides `find()`, `create()`, etc.)

---

### TypeScript Interfaces

Each interface defines the shape of a sub-document or the main document. These provide compile-time type checking — TypeScript will error if you try to access a field that doesn't exist.

```typescript
export interface IScheduleDay {
  day: string;
  opens_at: number;
  closes_at: number;
}
```
A single day in a weekly schedule. Times are stored as **minutes from midnight** (e.g. 9:00 AM = 540, 5:00 PM = 1020). This makes time math easy without parsing strings.

```typescript
export interface ISpreadsheetService {
  ...
  service_belongs_to_org?: string;
}
```
A service imported from a spreadsheet. The key difference from `IService` is `service_belongs_to_org` — this tells the submit flow which existing SFSG org to attach the service to (for the "submit service to existing org" workflow).

```typescript
export interface IService {
  sfsg_id?: number;
  ...
}
```
A service offered by the org. `sfsg_id` is populated after submission to SFSG — it's the ID assigned by their system.

```typescript
export interface IHistoryEntry {
  action: 'created' | 'edited' | 'moved' | 'submitted';
  by: string;
  at: Date;
  detail?: string;
}
```
Audit trail entry. `action` is a union type — TypeScript enforces only these four values. `by` is `'unknown'` until authentication is added.

```typescript
export interface IOrg extends Document {
```
The main document interface. `extends Document` adds Mongoose document methods (`save()`, `remove()`, `toJSON()`, etc.) and the `_id` field.

---

### Mongoose Schemas

Schemas define the database-level structure, validation, and defaults. They're separate from interfaces because:
- Interfaces = compile-time TypeScript checking
- Schemas = runtime MongoDB validation and casting

```typescript
const ScheduleDaySchema = new Schema<IScheduleDay>({
  day:       { type: String },
  opens_at:  { type: Number },
  closes_at: { type: Number },
}, { _id: false });
```
- `new Schema<IScheduleDay>(...)` — creates a schema typed to the interface
- `{ type: String }` — Mongoose schema type (not TypeScript's `string`)
- `{ _id: false }` — sub-documents don't get their own `_id` field (saves space, they're always accessed through the parent)

```typescript
const SpreadsheetServiceSchema = new Schema<ISpreadsheetService>({
  ...
  schedule: { type: ScheduleSchema, default: () => ({ schedule_days: [] }) },
  ...
}, { _id: false });
```
- `default: () => ({ schedule_days: [] })` — factory function that creates a fresh default object for each new document. Using a function (not a literal) prevents all documents from sharing the same array reference.

```typescript
const ServiceSchema = new Schema<IService>({
  ...
  name: { type: String, required: false, default: 'Unnamed Service' },
  ...
});
```
- `required: false` — the field is optional
- `default: 'Unnamed Service'` — if not provided, this value is used

```typescript
const HistoryEntrySchema = new Schema<IHistoryEntry>({
  action: { type: String, enum: ['created', 'edited', 'moved', 'submitted'], required: true },
  by:     { type: String, default: 'unknown' },
  at:     { type: Date,   default: () => new Date() },
  detail: { type: String },
}, { _id: false });
```
- `enum: [...]` — MongoDB-level validation. If you try to save an action not in this list, Mongoose throws a validation error.
- `default: () => new Date()` — factory function so each entry gets its own timestamp (not the time the schema was defined).

```typescript
const OrgSchema = new Schema<IOrg>({
  ...
  bucket: { type: String, required: true },
  status: { type: String, enum: ['incomplete', 'pending', 'complete'], default: 'incomplete' },
  ...
}, { timestamps: true });
```
- `required: true` — the org MUST have a bucket. Mongoose will reject `save()` without it.
- `enum` on status — only these three values are valid
- `{ timestamps: true }` — Mongoose automatically adds and manages `createdAt` and `updatedAt` fields. On `create()`, both are set. On `save()`, `updatedAt` is refreshed.

---

### Model Export

```typescript
export const Org: Model<IOrg> = mongoose.model<IOrg>('Org', OrgSchema);
```
- `mongoose.model('Org', OrgSchema)` — registers the schema with Mongoose and creates a model
- `'Org'` — the model name. Mongoose lowercases and pluralizes this to get the collection name: `orgs`
- `Model<IOrg>` — TypeScript type annotation. When you call `Org.find()`, the results are typed as `IOrg[]`

After this line, you can use:
- `Org.find({ bucket: 'DCYF' })` — query
- `Org.create({ name: 'Test', bucket: 'DCYF' })` — insert
- `Org.findById(id)` — get by ID
- `Org.findByIdAndDelete(id)` — delete

---

## Why Embedded Documents (Not References)

Services are embedded directly in the org document rather than stored in a separate collection with references. This mirrors the SFSG API shape (one GET returns everything) and means:
- One read gets the full org with all services
- No `$lookup` / `populate()` needed
- Atomic writes — saving the org saves all its services in one operation
- Trade-off: large documents if an org has many services (acceptable for this use case)

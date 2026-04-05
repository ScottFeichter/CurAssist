// #region ===================== IMPORTS =======================================
import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { extendedConsole as console } from '../../../../streams/consoles/customConsoles';
import { log } from '../../../../utils/logger/logger-setup/logger-wrapper';
import { Bucket } from '../../../../database/models/bucket.model';
import { Org } from '../../../../database/models/org.model';
import { createBucketStructure, parseSpreadsheet, generateOrgDocuments, hydrateTemplate } from '../../../helpers/bucket-helpers';
// #endregion ------------------------------------------------------------------

console.enter();

// #region ===================== ROUTER ========================================

const bucketsRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/** The fixed set of subdirectories — backed by org status field in MongoDB. */
const SUBDIRS = ['incomplete', 'pending', 'complete'];

// GET /api/buckets — List all bucket names
bucketsRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  log.enter('GET /api/buckets', log.brack);
  try {
    const buckets = await Bucket.find().sort({ createdAt: -1 }).select('name');
    log.retrn('GET /api/buckets', log.kcarb);
    res.json(buckets.map(b => b.name));
  } catch (error) {
    log.retrn('GET /api/buckets', log.kcarb);
    next(error);
  }
});

// GET /api/buckets/:bucket/subdirs — Returns fixed subdirectory list
bucketsRouter.get('/:bucket/subdirs', (_req: Request, res: Response) => {
  log.enter('GET /api/buckets/:bucket/subdirs', log.brack);
  log.retrn('GET /api/buckets/:bucket/subdirs', log.kcarb);
  res.json(SUBDIRS);
});

// GET /api/buckets/:bucket/:subdir/files — List orgs in a bucket/status
bucketsRouter.get('/:bucket/:subdir/files', async (req: Request, res: Response, next: NextFunction) => {
  log.enter('GET /api/buckets/:bucket/:subdir/files', log.brack);
  try {
    const { bucket, subdir } = req.params;
    const orgs = await Org.find({ bucket, status: subdir }).select('_id name').sort({ createdAt: 1 });
    log.retrn('GET /api/buckets/:bucket/:subdir/files', log.kcarb);
    res.json(orgs.map(o => ({ _id: o._id, name: o.name })));
  } catch (error) {
    log.retrn('GET /api/buckets/:bucket/:subdir/files', log.kcarb);
    next(error);
  }
});

// GET /api/buckets/:bucket/:subdir/:id — Get hydrated template for an org
bucketsRouter.get('/:bucket/:subdir/:id', async (req: Request, res: Response, next: NextFunction) => {
  log.enter('GET /api/buckets/:bucket/:subdir/:id', log.brack);
  try {
    const org = await Org.findById(req.params.id);
    if (!org) return res.status(404).json({ error: 'Org not found' });
    const html = await hydrateTemplate(org);
    log.retrn('GET /api/buckets/:bucket/:subdir/:id', log.kcarb);
    res.send(html);
  } catch (error) {
    log.retrn('GET /api/buckets/:bucket/:subdir/:id', log.kcarb);
    next(error);
  }
});

// POST /api/buckets/submit — Write sfId back to Atlas and move to complete after successful SFSG submission
bucketsRouter.post('/submit', async (req: Request, res: Response, next: NextFunction) => {
  log.enter('POST /api/buckets/submit', log.brack);
  try {
    const { id, sfId } = req.body;
    if (!id) return res.status(400).json({ success: false, error: 'id is required' });

    const org = await Org.findById(id);
    if (!org) return res.status(404).json({ success: false, error: 'Org not found' });

    if (sfId) org.sfId = sfId;
    org.status      = 'complete';
    org.submittedAt = new Date();
    org.history.push({ action: 'submitted', by: 'unknown', at: new Date() });
    org.markModified('history');
    await org.save();

    log.retrn('POST /api/buckets/submit', log.kcarb);
    res.json({ success: true });
  } catch (error) {
    log.retrn('POST /api/buckets/submit', log.kcarb);
    next(error);
  }
});

// POST /api/buckets/save — Save org field values from iframe
bucketsRouter.post('/save', async (req: Request, res: Response, next: NextFunction) => {
  log.enter('POST /api/buckets/save', log.brack);
  try {
    const { id, fields } = req.body;
    if (!id || !fields) return res.status(400).json({ success: false, error: 'id and fields are required' });

    const org = await Org.findById(id);
    if (!org) return res.status(404).json({ success: false, error: 'Org not found' });

    // ── Org scalar fields ──────────────────────────────────────────────────────
    if (fields.organization_name           != null) org.name             = fields.organization_name;
    if (fields.organization_alternate_name != null) org.alternate_name   = fields.organization_alternate_name;
    if (fields.organization_website        != null) org.website          = fields.organization_website;
    if (fields.organization_email          != null) org.email            = fields.organization_email;
    if (fields.organization_legal_status   != null) org.legal_status     = fields.organization_legal_status;
    if (fields.organization_description    != null) org.long_description = fields.organization_description;
    if (fields.organization_internal_notes != null) org.internal_note    = fields.organization_internal_notes;

    // ── Org phones ─────────────────────────────────────────────────────────────
    if (Array.isArray(fields.organization_phones)) {
      org.phones = fields.organization_phones
        .filter((p: any) => p.phone_number)
        .map((p: any) => ({ number: p.phone_number, service_type: p.phone_name || '' }));
    }

    // ── Org addresses ──────────────────────────────────────────────────────────
    if (Array.isArray(fields.organization_locations)) {
      org.addresses = fields.organization_locations.map((l: any) => ({
        address_1:      l.address_1  || '',
        address_2:      l.address_2  || '',
        city:           l.city       || '',
        state_province: l.state      || '',
        postal_code:    l.zip        || ''
      }));
    }

    // ── Service fields ──────────────────────────────────────────────────────────
    if (org.services.length === 0) org.services.push({ name: org.name } as any);
    const svc = org.services[0] as any;

    if (fields.service_name                    != null) svc.name                    = fields.service_name;
    if (fields.service_alternate_name          != null) svc.alternate_name          = fields.service_alternate_name;
    if (fields.service_email                   != null) svc.email                   = fields.service_email;
    if (fields.service_website                 != null) svc.url                     = fields.service_website;
    if (fields.service_cost                    != null) svc.fee                     = fields.service_cost;
    if (fields.service_wait_time               != null) svc.wait_time               = fields.service_wait_time;
    if (fields.service_description             != null) svc.long_description        = fields.service_description;
    if (fields.service_short_description       != null) svc.short_description       = fields.service_short_description;
    if (fields.service_application_process     != null) svc.application_process     = fields.service_application_process;
    if (fields.service_required_documents      != null) svc.required_documents      = fields.service_required_documents;
    if (fields.service_interpretation_services != null) svc.interpretation_services = fields.service_interpretation_services;
    if (fields.service_clinician_actions       != null) svc.clinician_actions       = fields.service_clinician_actions;
    if (fields.service_internal_notes          != null) svc.internal_note           = fields.service_internal_notes;

    if (Array.isArray(fields.service_top_categories))    svc.categories    = [...(fields.service_top_categories || []), ...(fields.service_sub_categories || [])];
    if (Array.isArray(fields.service_top_eligibilities)) svc.eligibilities = [...(fields.service_top_eligibilities || []), ...(fields.service_sub_eligibilities || [])];

    if (Array.isArray(fields.service_phones)) {
      svc.phones = fields.service_phones
        .filter((p: any) => p.phone_number)
        .map((p: any) => ({ number: p.phone_number, service_type: p.phone_name || '' }));
    }

    if (Array.isArray(fields.service_locations)) {
      svc.addresses = fields.service_locations.map((l: any) => ({
        address_1:      l.address_1 || '',
        address_2:      l.address_2 || '',
        city:           l.city      || '',
        state_province: l.state     || '',
        postal_code:    l.zip       || ''
      }));
    }

    org.history.push({ action: 'edited', by: 'unknown', at: new Date() });
    org.markModified('services');
    org.markModified('phones');
    org.markModified('addresses');
    org.markModified('history');
    await org.save();

    log.retrn('POST /api/buckets/save', log.kcarb);
    res.json({ success: true });
  } catch (error) {
    log.retrn('POST /api/buckets/save', log.kcarb);
    next(error);
  }
});

// POST /api/buckets/move — Change org status (move between subdirectories)
bucketsRouter.post('/move', async (req: Request, res: Response, next: NextFunction) => {
  log.enter('POST /api/buckets/move', log.brack);
  try {
    const { id, fromBucket, fromSubdir, toBucket, toSubdir } = req.body;
    if (!id || !toBucket || !toSubdir) return res.status(400).json({ success: false, error: 'id, toBucket, and toSubdir are required' });

    const org = await Org.findById(id);
    if (!org) return res.status(404).json({ success: false, error: 'Org not found' });

    org.bucket = toBucket;
    org.status = toSubdir as 'incomplete' | 'pending' | 'complete';
    org.history.push({ action: 'moved', by: 'unknown', at: new Date(), detail: `${fromBucket}/${fromSubdir} → ${toBucket}/${toSubdir}` });
    org.markModified('history');
    await org.save();

    log.retrn('POST /api/buckets/move', log.kcarb);
    res.json({ success: true });
  } catch (error) {
    log.retrn('POST /api/buckets/move', log.kcarb);
    next(error);
  }
});

// POST /api/buckets/create-file — Create a blank org or copy an existing one
bucketsRouter.post('/create-file', async (req: Request, res: Response, next: NextFunction) => {
  log.enter('POST /api/buckets/create-file', log.brack);
  try {
    const { bucket, subdir, filename, fromId } = req.body;
    if (!bucket || !subdir) return res.status(400).json({ success: false, error: 'bucket and subdir are required' });
    if (!fromId && !filename) return res.status(400).json({ success: false, error: 'filename is required when not copying' });

    let newOrg;
    if (fromId) {
      const source = await Org.findById(fromId).lean();
      if (!source) return res.status(404).json({ success: false, error: 'Source org not found' });
      const { _id, createdAt, updatedAt, ...rest } = source as any;

      // Use user-provided name, or auto-generate "Copy of X" with uniqueness check
      let copyName = filename?.trim();
      if (!copyName) {
        const baseName = source.name || 'New Service';
        const copyBase = `Copy of ${baseName}`;
        const existingCount = await Org.countDocuments({ bucket, name: new RegExp(`^Copy of ${baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`) });
        copyName = existingCount === 0 ? copyBase : `${copyBase} ${existingCount + 1}`;
      }

      newOrg = await Org.create({
        ...rest,
        name: copyName,
        bucket,
        status: subdir,
        history: [{ action: 'created', by: 'unknown', at: new Date(), detail: `copied from ${source.name}` }]
      });
    } else {
      newOrg = await Org.create({
        name: filename,
        bucket,
        status: subdir,
        history: [{ action: 'created', by: 'unknown', at: new Date() }]
      });
    }

    log.retrn('POST /api/buckets/create-file', log.kcarb);
    res.json({ success: true, _id: newOrg._id, name: newOrg.name });
  } catch (error) {
    log.retrn('POST /api/buckets/create-file', log.kcarb);
    next(error);
  }
});

// POST /api/buckets/import-file — Import org from SF Service Guide by ID
bucketsRouter.post('/import-file', async (req: Request, res: Response, next: NextFunction) => {
  log.enter('POST /api/buckets/import-file', log.brack);
  try {
    const { bucket, subdir, orgId } = req.body;
    if (!bucket || !subdir || !orgId) return res.status(400).json({ success: false, error: 'bucket, subdir, and orgId are required' });

    const sfRes = await fetch(`https://www.sfserviceguide.org/api/v2/resources/${orgId}`, {
      headers: {
        'Accept': 'application/json',
        'Origin': 'https://www.sfserviceguide.org',
        'Referer': 'https://www.sfserviceguide.org/organizations/new'
      }
    });
    if (!sfRes.ok) return res.status(sfRes.status).json({ success: false, error: `SF API returned ${sfRes.status}` });

    const { resource } = await sfRes.json() as { resource: any };
    if (!resource) return res.status(404).json({ success: false, error: 'No resource found for that ID' });

    const newOrg = await Org.create({
      sfId:      resource.id,
      name:      resource.name,
      bucket,
      status:    subdir,
      addresses: resource.addresses || [],
      phones:    resource.phones || [],
      notes:     resource.notes || [],
      schedule:  resource.schedule || { schedule_days: [] },
      services:  (resource.services || []).map((s: any) => ({
        sfId:                            s.id,
        name:                            s.name,
        notes:                           s.notes || [],
        schedule:                        s.schedule || { schedule_days: [] },
        shouldInheritScheduleFromParent: s.shouldInheritScheduleFromParent ?? true,
        eligibilities:                   s.eligibilities || [],
        categories:                      s.categories || [],
      })),
      history: [{ action: 'created', by: 'unknown', at: new Date(), detail: `imported from SFSG org ID ${orgId}` }]
    });

    log.retrn('POST /api/buckets/import-file', log.kcarb);
    res.json({ success: true, _id: newOrg._id, name: newOrg.name });
  } catch (error) {
    log.retrn('POST /api/buckets/import-file', log.kcarb);
    next(error);
  }
});

// POST /api/buckets/create — Create bucket from spreadsheet upload
bucketsRouter.post('/create', upload.single('spreadsheet'), async (req: Request, res: Response, next: NextFunction) => {
  log.enter('POST /api/buckets/create', log.brack);
  try {
    const { bucketName } = req.body;
    const file = req.file;

    if (!file)       return res.status(400).json({ success: false, error: 'No spreadsheet file uploaded' });
    if (!bucketName) return res.status(400).json({ success: false, error: 'Bucket name is required' });

    await createBucketStructure(bucketName);
    const { rows } = await parseSpreadsheet(file.buffer);
    await generateOrgDocuments(bucketName, rows, (_progress) => {});

    log.retrn('POST /api/buckets/create', log.kcarb);
    res.json({ success: true, message: 'Bucket created successfully!' });
  } catch (error) {
    log.retrn('POST /api/buckets/create', log.kcarb);
    next(error);
  }
});

// DELETE /api/buckets/delete — Delete a single org
bucketsRouter.delete('/delete', async (req: Request, res: Response, next: NextFunction) => {
  log.enter('DELETE /api/buckets/delete', log.brack);
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ success: false, error: 'id is required' });
    await Org.findByIdAndDelete(id);
    log.retrn('DELETE /api/buckets/delete', log.kcarb);
    res.json({ success: true });
  } catch (error) {
    log.retrn('DELETE /api/buckets/delete', log.kcarb);
    next(error);
  }
});

// DELETE /api/buckets/:bucket — Delete entire bucket and all its orgs
bucketsRouter.delete('/:bucket', async (req: Request, res: Response, next: NextFunction) => {
  log.enter('DELETE /api/buckets/:bucket', log.brack);
  try {
    const { bucket } = req.params;
    await Org.deleteMany({ bucket });
    await Bucket.deleteOne({ name: bucket });
    log.retrn('DELETE /api/buckets/:bucket', log.kcarb);
    res.json({ success: true });
  } catch (error) {
    log.retrn('DELETE /api/buckets/:bucket', log.kcarb);
    next(error);
  }
});

export default bucketsRouter;

// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// All routes now use MongoDB instead of the filesystem
// File lists return { _id, name } objects instead of filename strings
// Subdirs are always the fixed SUBDIRS array — no DB query needed
// hydrateTemplate() injects org data into the combined HTML template at request time
// save route expects { id, fields } where fields is the collector output from the frontend
// move route updates org.bucket and org.status instead of renaming files
// copy route clones the org document with a new _id
// import route maps SFSG API response directly to the Org schema

// #endregion ------------------------------------------------------------------

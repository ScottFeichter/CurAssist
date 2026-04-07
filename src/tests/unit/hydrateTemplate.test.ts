// #region ===================== IMPORTS =======================================
import { hydrateTemplate } from '../../server/helpers/bucket-helpers';
import { IOrg } from '../../database/models/org.model';
import mongoose from 'mongoose';
// #endregion ------------------------------------------------------------------

// #region ====================== HELPERS ======================================

/** Minimal valid org for hydration tests */
function makeOrg(overrides: Partial<IOrg> = {}): IOrg {
  return {
    _id:           new mongoose.Types.ObjectId(),
    name:          'Test Org',
    alternate_name: 'Test Alias',
    email:         'test@example.com',
    website:       'https://example.com',
    long_description: 'A test org description.',
    legal_status:  'Nonprofit',
    internal_note: 'Internal note here.',
    addresses:     [],
    phones:        [],
    notes:         [],
    schedule:      { schedule_days: [] },
    services:      [],
    bucket:        'Test Bucket',
    status:        'incomplete',
    history:       [],
    createdAt:     new Date(),
    updatedAt:     new Date(),
    ...overrides
  } as unknown as IOrg;
}

// #endregion ------------------------------------------------------------------

// #region ====================== TESTS ========================================

describe('hydrateTemplate', () => {

  it('returns a string starting with <!DOCTYPE html>', async () => {
    const html = await hydrateTemplate(makeOrg());
    expect(html.startsWith('<!DOCTYPE html>')).toBe(true);
  });

  it('stamps data-org-id on the body tag', async () => {
    const org = makeOrg();
    const html = await hydrateTemplate(org);
    expect(html).toContain(`data-org-id="${org._id}"`);
  });

  // ── Org scalar fields ──────────────────────────────────────────────────────

  it('injects organization_name', async () => {
    const html = await hydrateTemplate(makeOrg({ name: 'Mission Food Bank' }));
    expect(html).toContain('value="Mission Food Bank"');
  });

  it('injects organization_alternate_name', async () => {
    const html = await hydrateTemplate(makeOrg({ alternate_name: 'MFB' }));
    expect(html).toContain('value="MFB"');
  });

  it('injects organization_website', async () => {
    const html = await hydrateTemplate(makeOrg({ website: 'https://mfb.org' }));
    expect(html).toContain('value="https://mfb.org"');
  });

  it('injects organization_email', async () => {
    const html = await hydrateTemplate(makeOrg({ email: 'info@mfb.org' }));
    expect(html).toContain('value="info@mfb.org"');
  });

  it('injects organization_description textarea', async () => {
    const html = await hydrateTemplate(makeOrg({ long_description: 'We feed people.' }));
    expect(html).toContain('We feed people.');
  });

  // ── SFSG import flag ───────────────────────────────────────────────────────

  it('sets importedFileFromSFSG=true when org has sfsg_id and no spreadsheetService', async () => {
    const html = await hydrateTemplate(makeOrg({ sfsg_id: 1234 }));
    expect(html).toContain('let importedFileFromSFSG = true;');
  });

  it('leaves importedFileFromSFSG=false when org has sfsg_id but also has spreadsheetService', async () => {
    const html = await hydrateTemplate(makeOrg({ sfsg_id: 1234, spreadsheetService: { name: 'Test Svc', notes: [], schedule: { schedule_days: [] }, shouldInheritScheduleFromParent: true, eligibilities: [], categories: [], addresses: [], phones: [] } as any }));
    expect(html).toContain('let importedFileFromSFSG = false;');
  });

  it('leaves importedFileFromSFSG=false when org has no sfsg_id', async () => {
    const html = await hydrateTemplate(makeOrg({ sfsg_id: undefined }));
    expect(html).toContain('let importedFileFromSFSG = false;');
  });

  // ── Addresses ─────────────────────────────────────────────────────────────

  it('injects org addresses as location-row divs', async () => {
    const html = await hydrateTemplate(makeOrg({
      addresses: [{ name: 'Main Office', address_1: '123 Main St', city: 'San Francisco', state_province: 'CA', postal_code: '94103' }]
    }));
    expect(html).toContain('location-row');
    expect(html).toContain('Main Office');
    expect(html).toContain('123 Main St');
    expect(html).toContain('San Francisco');
  });

  it('injects multiple addresses with sequential numbers', async () => {
    const html = await hydrateTemplate(makeOrg({
      addresses: [
        { address_1: '100 First St', city: 'SF', state_province: 'CA', postal_code: '94100' },
        { address_1: '200 Second St', city: 'SF', state_province: 'CA', postal_code: '94101' }
      ]
    }));
    expect(html).toContain('location-row-num">1.');
    expect(html).toContain('location-row-num">2.');
  });

  // ── Phones ────────────────────────────────────────────────────────────────

  it('injects org phones as phone-row list items', async () => {
    const html = await hydrateTemplate(makeOrg({
      phones: [{ number: '415-555-1234', service_type: 'Main' }]
    }));
    expect(html).toContain('phone-row');
    expect(html).toContain('415-555-1234');
    expect(html).toContain('Main');
  });

  it('injects multiple phones with sequential numbers', async () => {
    const html = await hydrateTemplate(makeOrg({
      phones: [
        { number: '415-555-0001', service_type: 'Main' },
        { number: '415-555-0002', service_type: 'Fax' }
      ]
    }));
    expect(html).toContain('phone-row-num">1.');
    expect(html).toContain('phone-row-num">2.');
  });

  // ── Services ──────────────────────────────────────────────────────────────

  it('injects services into orgServicesDiv', async () => {
    const html = await hydrateTemplate(makeOrg({
      services: [{
        name: 'Food Pantry', notes: [], schedule: { schedule_days: [] },
        shouldInheritScheduleFromParent: true, eligibilities: [], categories: [],
        addresses: [], phones: []
      }]
    }));
    expect(html).toContain('id="orgServicesDiv"');
    expect(html).toContain('id="service-org-0"');
    expect(html).toContain('value="Food Pantry"');
  });

  it('injects multiple services with unique ids', async () => {
    const html = await hydrateTemplate(makeOrg({
      services: [
        { name: 'Service A', notes: [], schedule: { schedule_days: [] }, shouldInheritScheduleFromParent: true, eligibilities: [], categories: [], addresses: [], phones: [] },
        { name: 'Service B', notes: [], schedule: { schedule_days: [] }, shouldInheritScheduleFromParent: true, eligibilities: [], categories: [], addresses: [], phones: [] }
      ]
    }));
    expect(html).toContain('id="service-org-0"');
    expect(html).toContain('id="service-org-1"');
  });

  it('populates sidebar service nav links', async () => {
    const html = await hydrateTemplate(makeOrg({
      services: [{
        name: 'Prenatal Care', notes: [], schedule: { schedule_days: [] },
        shouldInheritScheduleFromParent: true, eligibilities: [], categories: [],
        addresses: [], phones: []
      }]
    }));
    expect(html).toContain('Prenatal Care');
    expect(html).toContain('href="#service-org-0"');
  });

  it('uses "Service N" as sidebar label for unnamed services', async () => {
    const html = await hydrateTemplate(makeOrg({
      services: [{
        name: '', notes: [], schedule: { schedule_days: [] },
        shouldInheritScheduleFromParent: true, eligibilities: [], categories: [],
        addresses: [], phones: []
      }]
    }));
    expect(html).toContain('Service 1');
  });

  it('injects service categories as pills', async () => {
    const html = await hydrateTemplate(makeOrg({
      services: [{
        name: 'Test Service', notes: [], schedule: { schedule_days: [] },
        shouldInheritScheduleFromParent: true,
        eligibilities: [], categories: ['Food', 'Health'],
        addresses: [], phones: []
      }]
    }));
    expect(html).toContain('Select-value-label">Food');
    expect(html).toContain('Select-value-label">Health');
  });

  it('injects service eligibilities as pills', async () => {
    const html = await hydrateTemplate(makeOrg({
      services: [{
        name: 'Test Service', notes: [], schedule: { schedule_days: [] },
        shouldInheritScheduleFromParent: true,
        eligibilities: ['Adults', 'Seniors'], categories: [],
        addresses: [], phones: []
      }]
    }));
    expect(html).toContain('Select-value-label">Adults');
    expect(html).toContain('Select-value-label">Seniors');
  });

  it('injects service scalar fields', async () => {
    const html = await hydrateTemplate(makeOrg({
      services: [{
        name: 'Test', fee: '$10', wait_time: '2 weeks',
        long_description: 'Service description here.',
        notes: [], schedule: { schedule_days: [] },
        shouldInheritScheduleFromParent: true, eligibilities: [], categories: [],
        addresses: [], phones: []
      }]
    }));
    expect(html).toContain('Service description here.');
    // fee and wait_time are injected into service_cost and service_wait_time inputs
    expect(html).toContain('id="service-org-0"');
  });

  // ── Empty org ─────────────────────────────────────────────────────────────

  it('handles org with no addresses, phones or services without error', async () => {
    const html = await hydrateTemplate(makeOrg({
      addresses: [], phones: [], services: []
    }));
    expect(html).toBeTruthy();
    expect(html).toContain('data-org-id=');
  });

});

// #endregion ------------------------------------------------------------------

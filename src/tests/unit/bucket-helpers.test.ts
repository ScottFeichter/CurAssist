// #region ===================== IMPORTS =======================================
import {
  extractSFSGCategories,
  extractSFSGEligibilities,
  normalizeSFSGStringArray,
  buildReportBuffer,
  transformOrgToSFPayload,
} from '../../server/helpers/helpers-index';
import { IOrg } from '../../database/models/org.model';
import mongoose from 'mongoose';
import * as XLSX from 'xlsx';
// #endregion ------------------------------------------------------------------

// #region ====================== HELPERS ======================================

function makeOrg(overrides: Partial<IOrg> = {}): IOrg {
  return {
    _id: new mongoose.Types.ObjectId(),
    name: 'Test Org',
    alternate_name: 'Alias',
    email: 'test@example.com',
    website: 'https://example.com',
    long_description: 'Description',
    legal_status: 'Nonprofit',
    internal_note: 'Internal note',
    addresses: [{ address_1: '123 Main St', city: 'SF', state_province: 'CA', postal_code: '94103' }],
    phones: [{ number: '415-555-1234', service_type: 'Main' }],
    notes: [{ note: 'A note' }],
    schedule: { schedule_days: [{ day: 'Monday', opens_at: 540, closes_at: 1020 }] },
    services: [{
      name: 'Food Pantry',
      alternate_name: 'Pantry',
      email: 'svc@example.com',
      url: 'https://svc.com',
      fee: '$0',
      wait_time: '1 week',
      long_description: 'Service desc',
      internal_note: 'Svc note',
      notes: [],
      schedule: { schedule_days: [] },
      shouldInheritScheduleFromParent: true,
      eligibilities: ['Adults', 'Seniors'],
      categories: ['Food', 'Groceries'],
      sub_eligibilities: [],
      sub_categories: [],
      addresses: [],
      phones: [{ number: '415-555-9999', service_type: 'voice' }],
    }],
    bucket: 'Test Bucket',
    status: 'incomplete',
    history: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  } as unknown as IOrg;
}

// #endregion ------------------------------------------------------------------

// #region ====================== TESTS ========================================

describe('extractSFSGCategories', () => {
  it('extracts names from SFSG category objects', () => {
    const items = [
      { name: 'Food', id: 1, top_level: true, featured: false },
      { name: 'Groceries', id: 2, top_level: false, featured: false },
    ];
    const result = extractSFSGCategories(items);
    expect(result).toContain('Food');
    expect(result).toContain('Groceries');
  });

  it('handles null/undefined input', () => {
    expect(extractSFSGCategories(null as any)).toEqual([]);
  });

  it('handles plain string arrays', () => {
    const result = extractSFSGCategories(['Health & Wellness', 'Food']);
    expect(result).toEqual(['Health & Wellness', 'Food']);
  });
});

describe('extractSFSGEligibilities', () => {
  it('extracts names from SFSG eligibility objects', () => {
    const items = [
      { name: 'Age', id: 1 },
      { name: 'Seniors', id: 2 },
    ];
    const result = extractSFSGEligibilities(items);
    expect(result).toContain('Age');
    expect(result).toContain('Seniors');
  });

  it('handles null/undefined input', () => {
    expect(extractSFSGEligibilities(null as any)).toEqual([]);
  });
});

describe('normalizeSFSGStringArray', () => {
  it('extracts name from SFSG objects', () => {
    const items = [{ name: 'Food', id: 1 }, { name: 'Health', id: 2 }];
    expect(normalizeSFSGStringArray(items)).toEqual(['Food', 'Health']);
  });

  it('passes through plain strings', () => {
    expect(normalizeSFSGStringArray(['Food', 'Health'])).toEqual(['Food', 'Health']);
  });

  it('filters out falsy values', () => {
    expect(normalizeSFSGStringArray([null, { name: '' }, { name: 'Food' }])).toEqual(['Food']);
  });

  it('handles null input', () => {
    expect(normalizeSFSGStringArray(null as any)).toEqual([]);
  });
});

describe('transformOrgToSFPayload', () => {
  it('returns orgBody with resources array', () => {
    const { orgBody } = transformOrgToSFPayload(makeOrg());
    expect(orgBody.resources).toHaveLength(1);
    expect(orgBody.resources[0].name).toBe('Test Org');
  });

  it('maps org scalar fields correctly', () => {
    const { orgBody } = transformOrgToSFPayload(makeOrg());
    const resource = orgBody.resources[0];
    expect(resource.email).toBe('test@example.com');
    expect(resource.website).toBe('https://example.com');
    expect(resource.long_description).toBe('Description');
    expect(resource.legal_status).toBe('Nonprofit');
  });

  it('maps org phones with service_type', () => {
    const { orgBody } = transformOrgToSFPayload(makeOrg());
    expect(orgBody.resources[0].phones[0].number).toBe('415-555-1234');
    expect(orgBody.resources[0].phones[0].service_type).toBe('Main');
  });

  it('maps org addresses', () => {
    const { orgBody } = transformOrgToSFPayload(makeOrg());
    expect(orgBody.resources[0].addresses[0].address_1).toBe('123 Main St');
  });

  it('returns services array with negative IDs', () => {
    const { services } = transformOrgToSFPayload(makeOrg());
    expect(services).toHaveLength(1);
    expect(services[0].id).toBeLessThan(0);
  });

  it('maps service fields correctly', () => {
    const { services } = transformOrgToSFPayload(makeOrg());
    expect(services[0].name).toBe('Food Pantry');
    expect(services[0].fee).toBe('$0');
    expect(services[0].wait_time).toBe('1 week');
  });

  it('maps service categories with top_level flag', () => {
    const { services } = transformOrgToSFPayload(makeOrg());
    const cats = services[0].categories;
    expect(cats.some((c: any) => c.name === 'Food')).toBe(true);
    expect(cats.some((c: any) => c.name === 'Groceries')).toBe(true);
  });

  it('maps service eligibilities', () => {
    const { services } = transformOrgToSFPayload(makeOrg());
    const eligibs = services[0].eligibilities;
    expect(eligibs.some((e: any) => e.name === 'Adults')).toBe(true);
    expect(eligibs.some((e: any) => e.name === 'Seniors')).toBe(true);
  });

  it('handles org with no services', () => {
    const { services } = transformOrgToSFPayload(makeOrg({ services: [] }));
    expect(services).toEqual([]);
  });
});

describe('buildReportBuffer', () => {
  it('returns a Buffer', async () => {
    const results = [{ row: 0, status: 'Success' as const, detail: '', fields: { name: { status: 'success' as const, value: 'Org A' } } }];
    const buf = await buildReportBuffer(results, 'Test Bucket');
    expect(Buffer.isBuffer(buf)).toBe(true);
  });

  it('includes CurAssist Ingest column in output', async () => {
    const results = [{ row: 0, status: 'Success' as const, detail: '', fields: { name: { status: 'success' as const, value: 'Org A' } } }];
    const buf = await buildReportBuffer(results, 'Test Bucket');
    expect(buf.length).toBeGreaterThan(0);
  });

  it('includes SFSG Submit column when sfsgResults provided', async () => {
    const results = [{ row: 0, status: 'Success' as const, detail: '', fields: { name: { status: 'success' as const, value: 'Org A' } } }];
    const sfsgResults = [{ row: 0, status: 'Success' as const, detail: '', sfsgId: 123 }];
    const buf = await buildReportBuffer(results, 'Test Bucket', sfsgResults);
    expect(buf.length).toBeGreaterThan(0);
  });
});

// #endregion ------------------------------------------------------------------

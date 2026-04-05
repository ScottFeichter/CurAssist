// #region ====================== START ========================================

/** A minimal valid org document for use in tests. */
export const mockOrg = {
  name:      'Test Org',
  bucket:    'Test Bucket',
  status:    'incomplete' as const,
  addresses: [{ address_1: '123 Main St', city: 'San Francisco', state_province: 'CA', postal_code: '94103' }],
  phones:    [{ number: '415-555-1234', service_type: 'Main' }],
  notes:     [{ note: 'Test org description' }],
  schedule:  { schedule_days: [] },
  services:  [{
    name:                            'Test Service',
    notes:                           [{ note: 'Test service description' }],
    schedule:                        { schedule_days: [] },
    shouldInheritScheduleFromParent: true,
    eligibilities:                   ['Adults'],
    categories:                      ['Food']
  }],
  history: [{ action: 'created' as const, by: 'unknown', at: new Date() }]
};

/** A minimal valid bucket document for use in tests. */
export const mockBucket = {
  name:      'Test Bucket',
  createdBy: 'unknown'
};

/** Mock spreadsheet rows for testing generateOrgDocuments. */
export const mockSpreadsheetRows = [
  {
    'Name':         'Mission Food Bank',
    'Nickname':     'MFB',
    'Description':  'Provides food assistance',
    'Website':      'https://example.com',
    'Email':        'info@example.com',
    'Phone':        '4155551234',
    'Phone Name':   'Main',
    'Address':      '123 Mission St',
    'City':         'San Francisco',
    'State':        'CA',
    'Zip':          '94103',
    'Location Name': 'Main Office',
  },
  {
    'Name': '',  // intentionally blank to test fallback naming
  }
];

// #endregion ------------------------------------------------------------------

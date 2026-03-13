// Test values extracted from CuraTest 3.13.26.2.html
// Used by build-test-template.js to produce orgServTemplate-combinedTestValues.html

const testOrgValues = {
  organization: {
    organization_name: 'name of org',
    organization_alternate_name: 'nickname',
    organization_description: 'test description',
    organization_short_description: 'test short description',
    organization_website: 'https://www.testwebsite.com',
    organization_email: 'test@testemail.com',
    organization_internal_notes: 'test internal notes',
    organization_id: '',
    phones: [
      { number: '415-555-1234', ext: '', vanity: '', type: 'voice', description: 'Main line' }
    ],
    locations: [
      { name: 'Main Office', address1: '123 Test St', address2: 'Suite 1', city: 'San Francisco', state: 'CA', zip: '94103' }
    ],
    hours: {
      Monday:    { open: '08:00', close: '17:00' },
      Tuesday:   { open: '08:00', close: '17:00' },
      Wednesday: { open: '08:00', close: '17:00' },
      Thursday:  { open: '08:00', close: '17:00' },
      Friday:    { open: '08:00', close: '17:00' },
      Saturday:  { open: '', close: '' },
      Sunday:    { open: '', close: '' },
    }
  },
  services: [
    {
      id: 'service-test-001',
      service_name: 'Test Service',
      service_alternate_name: 'test alt name',
      service_description: 'test service description',
      service_short_description: 'test service short description',
      service_email: 'service@testemail.com',
      service_belongs_to_org: '',
      service_internal_notes: 'test service internal notes',
      phones: [
        { number: '415-555-5678', ext: '', type: 'voice', description: 'Service line' }
      ],
      locations: [
        { name: 'Service Location', address1: '456 Service Ave', address2: '', city: 'San Francisco', state: 'CA', zip: '94105' }
      ]
    },
    {
      id: 'service-test-002',
      service_name: 'test service 2',
      service_alternate_name: '',
      service_description: 'second service description',
      service_short_description: '',
      service_email: '',
      service_belongs_to_org: '',
      service_internal_notes: '',
      phones: [],
      locations: []
    }
  ]
};

module.exports = testOrgValues;

/**
 * Maps HTML input identifiers to spreadsheet column names
 *
 * HOW IT WORKS:
 * - Keys (left side): Identifiers from orgServTemplate.html
 *   - For organization section: data-field attribute values
 *   - For service section: placeholder text (since no data-field exists)
 * - Values (right side): Exact column names from your spreadsheet
 *
 * EXAMPLE:
 * If your spreadsheet has "Organization Name" column:
 *   'name': 'Organization Name'  // matches org section data-field="name"
 *   'What is this service called?': 'Organization Name'  // matches service section placeholder
 *
 * Both HTML fields will be populated with the same spreadsheet value.
 *
 * NOTE: Phone, Location, and Hours fields are not included because:
 * - They use dynamic "Add" buttons (not yet functional)
 * - They have no identifiable attributes (no data-field, id, or name)
 * - They cannot be populated until the add functionality is implemented
 */

// Organization section fields (using data-field attributes)
export const orgFieldMap: Record<string, string> = {
  name: 'Organization Name',
  alternate_name: 'Alternate Name',
  website: 'Website',
  email: 'Email',
  long_description: 'Description',
  legal_status: 'Legal Status',
  internal_note: 'Internal Notes',
  locations: 'Locations',
  phones: 'Phones',
  notes: 'Notes',
};

// Service section fields (using placeholder text as identifiers)
export const serviceFieldMap: Record<string, string> = {
  'Add any info that future content editors should be aware of when updating this service. Adding dates to your notes will help with tracking changes.': 'Internal Notes',
  'What is this service called?': 'Service Name',
  'What it\'s known as in the community': 'Nickname',
  service_locations: 'Service Locations',
  'Email address for this service': 'Service Email',
  'Describe what you\'ll receive from this service in a few sentences.': 'Service Description',
  'How do you apply for this service?': 'Application Process',
  'What documents do you need to bring to apply?': 'Required Documents',
  'What interpretation services do they offer?': 'Interpretation Services',
  'Add a list of actions to be taken by clinician and/or client prior to providing service referral (markdown is supported)': 'Clinician Actions',
  'How much does this service cost?': 'Cost',
  'Is there a waiting list or wait time?': 'Wait Time',
  'http://': 'Service Website',
  service_notes: 'Service Notes',
};

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
};

// Service section fields (using placeholder text as identifiers)
export const serviceFieldMap: Record<string, string> = {
  'What is this service called?': 'Organization Name',
  'What it\'s known as in the community': 'Alternate Name',
  'Email address for this service': 'Email',
  'http://': 'Website',
  'How much does this service cost?': 'Cost',
  'Is there a waiting list or wait time?': 'Wait Time',
};

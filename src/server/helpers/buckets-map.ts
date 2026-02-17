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
 * LOCATION HANDLING:
 * - orgFieldMap includes 'locations' key for HTML data-field reference
 * - locationFieldMap defines the actual spreadsheet columns (Address, City, State, Zip)
 * - bucket-helpers.ts combines these columns into the locations list
 * - To change spreadsheet column names, edit locationFieldMap values
 *
 * NOTE: Phone, Hours, and Notes fields with "Add" buttons require special handling.
 */

// Organization section fields (using id attributes)
export const orgFieldMap: Record<string, string> = {
  organization_internal_notes: 'Internal Notes',
  organization_name: 'Name',
  organization_alternate_name: 'Nickname',
  organization_locations: 'Locations', // Special: uses OrganizationLocationFieldMap for actual data
  organization_phones: 'Phone', // Special: uses OrganizationPhonenFieldMap for actual data
  organization_website: 'Website',
  organization_email: 'Email',
  organization_description: 'Description',
  organization_legal_status: 'Legal Status',
  organiztion_hours: "Hours", // need to work on it
  organization_markdown_notes: 'Markdown Notes',
};

// Location fields mapping (special handling required)
export const OrganizationLocationFieldMap = {
  location_name: "Location Name",
  address: 'Address',
  city: 'City',
  state: 'State',
  zip: 'Zip',
};

// Service location fields mapping (uses same columns as organization locations)
export const serviceLocationFieldMap = {
  address: 'Address',
  city: 'City',
  state: 'State',
  zip: 'Zip',
};

// Service section fields (using id attributes)
export const serviceFieldMap: Record<string, string> = {
  service_internal_notes: 'Internal Notes',
  service_name: 'Name',
  service_nickname: 'Nickname',
  service_locations: 'Locations', // Special: uses ServiceLocationFieldMap for actual data
  service_email: 'Email',
  service_description: 'Description',
  service_short_description: 'Short Description',
  service_application_process: 'Application Process',
  service_required_documents: 'Required Documents',
  service_interpretation_services: 'Interpretation Services',
  service_clinician_actions: 'Clinician Actions',
  service_eligibilities: 'Eligibility', // need to work on it
  service_cost: "Cost",
  service_wait_time: 'Wait Time',
  service_website: 'Website',
  service_hours: "Hours", // need to work on it
  service_markdown_notes: 'Markdown Notes',
  service_categories: 'Categories', // need to work on it
};

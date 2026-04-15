// #region ===================== IMPORTS =======================================
import { extendedConsole as console } from '../../streams/consoles/customConsoles';
// #endregion ------------------------------------------------------------------

console.enter();


// #region ===================== FIELD MAPS ====================================

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
  organization_locations: 'Locations', // Special: uses organizationLocationFieldMap for actual data
  organization_phones: 'Phone', // Special: uses organizationPhonenFieldMap for actual data
  organization_website: 'Website',
  organization_email: 'Email',
  organization_description: 'Description',
  organization_legal_status: 'Legal Status',
  organiztion_hours: "Hours", // need to work on it
  organization_markdown_notes: 'Markdown Notes',
  organization_top_categories: 'Top Categories',
  organization_top_eligibilities: 'Top Eligibilities',
};

// Service section fields (using id attributes) — spreadsheet headers prefixed with "Service"
export const serviceFieldMap: Record<string, string> = {
  service_internal_notes: 'Service Internal Notes',
  service_name: 'Service Name',
  service_alternate_name: 'Service Nickname',
  service_locations: 'Service Locations', // Special: uses serviceLocationFieldMap for actual data
  service_email: 'Service Email',
  service_description: 'Service Description',
  service_short_description: 'Service Short Description',
  service_application_process: 'Service Application Process',
  service_required_documents: 'Service Required Documents',
  service_interpretation_services: 'Service Interpretation Services',
  service_clinician_actions: 'Service Clinician Actions',
  service_eligibilities: 'Service Eligibility', // need to work on it
  service_cost: 'Service Cost',
  service_wait_time: 'Service Wait Time',
  service_website: 'Service Website',
  service_hours: 'Service Hours', // need to work on it
  service_markdown_notes: 'Service Markdown Notes',
  service_top_categories: 'Service Top Categories',
  service_sub_categories: 'Service Sub Categories',
  service_top_eligibilities: 'Service Top Eligibilities',
  service_sub_eligibilities: 'Service Sub Eligibilities',
  service_belongs_to_org: 'Organization ID', // ID of the org this service belongs to
};

// Service location fields mapping (uses same columns as organization locations)
export const organizationLocationFieldMap = {
  location_name: "Location Name",
  address: 'Address',
  city: 'City',
  state: 'State',
  zip: 'Zip',
};

// Service location fields mapping — prefixed headers
export const serviceLocationFieldMap = {
  location_name: 'Service Location Name',
  address: 'Service Address',
  city: 'Service City',
  state: 'Service State',
  zip: 'Service Zip',
};

// Service phone fields mapping — prefixed headers
export const servicePhoneFieldMap = {
  phone_name: 'Service Phone Name',
  phone: 'Service Phone',
};

// Phone fields mapping (special handling required)
export const organizationPhoneFieldMap = {
  phone_name: "Phone Name",
  phone: 'Phone',
};







// #endregion ------------------------------------------------------------------

console.leave();

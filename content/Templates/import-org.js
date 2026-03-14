/**
 * import-org.js
 *
 * Reverse-transforms a SF API GET /v2/resources/:id response into inject-values shape,
 * builds a pre-populated HTML file from the template, and sets importedFileFromSFSG = true.
 *
 * Usage (called from buckets-routes.ts import-file endpoint):
 *   const { buildImportedOrgFile } = require('./import-org');
 *   const html = await buildImportedOrgFile(sfResource);
 */

const path = require('path');
const { execSync } = require('child_process');
const fs = require('fs');
const { injectInput, injectTextarea, injectPhoneList, injectLocationDiv } = require('./inject-values');

/**
 * Converts a SF API resource object into the inject-values organization shape.
 * @param {Object} resource - The `resource` object from GET /v2/resources/:id
 * @returns {Object} inject-values compatible org data
 */
function reverseTransformOrg(resource) {
  return {
    organization_name: resource.name || '',
    organization_alternate_name: resource.alternate_name || '',
    organization_description: resource.long_description || '',
    organization_short_description: resource.short_description || '',
    organization_website: resource.website || '',
    organization_email: resource.email || '',
    organization_internal_notes: resource.internal_note || '',
    organization_id: String(resource.id || ''),
    phones: (resource.phones || [])
      .filter(p => p.number)
      .map(p => ({ number: p.number || '', ext: p.extension || '', vanity: '', type: p.phone_type || 'voice', description: p.description || '' })),
    locations: (resource.addresses || []).map(a => ({
      name: a.name || '',
      address1: a.address_1 || '',
      address2: a.address_2 || '',
      city: a.city || '',
      state: a.state_province || '',
      zip: a.postal_code || ''
    })),
    hours: { Monday: {open:'',close:''}, Tuesday: {open:'',close:''}, Wednesday: {open:'',close:''}, Thursday: {open:'',close:''}, Friday: {open:'',close:''}, Saturday: {open:'',close:''}, Sunday: {open:'',close:''} }
  };
}

/**
 * Converts a SF API service object into the inject-values service shape.
 * @param {Object} svc - A service entry from resource.services[]
 * @param {string|number} orgId
 * @returns {Object}
 */
function reverseTransformService(svc, orgId) {
  return {
    id: `service-sf-${svc.id}`,
    service_name: svc.name || '',
    service_alternate_name: svc.alternate_name || '',
    service_description: svc.long_description || '',
    service_short_description: svc.short_description || '',
    service_email: svc.email || '',
    service_belongs_to_org: String(orgId || ''),
    service_internal_notes: svc.internal_note || '',
    service_application_process: svc.application_process || '',
    service_required_documents: svc.required_documents || '',
    service_interpretation_services: svc.interpretation_services || '',
    service_cost: svc.fee || '',
    service_wait_time: svc.wait_time || '',
    service_website: svc.url || '',
    phones: (svc.phones || [])
      .filter(p => p.number)
      .map(p => ({ number: p.number || '', ext: p.extension || '', type: p.phone_type || 'voice', description: p.description || '' })),
    locations: (svc.addresses || []).map(a => ({
      name: a.name || '',
      address1: a.address_1 || '',
      address2: a.address_2 || '',
      city: a.city || '',
      state: a.state_province || '',
      zip: a.postal_code || ''
    }))
  };
}

/**
 * Builds a phone list HTML string for injectPhoneList.
 * @param {Array} phones
 * @returns {string}
 */
function buildPhoneHtml(phones) {
  if (!phones || !phones.length) return '';
  return phones.map(p =>
    `<li><input type="text" class="phone-number" value="${p.number}"><input type="text" class="phone-ext" value="${p.ext || ''}"><input type="text" class="phone-type" value="${p.type}"><input type="text" class="phone-description" value="${p.description}"></li>`
  ).join('');
}

/**
 * Builds a location div HTML string for injectLocationDiv.
 * @param {Array} locations
 * @returns {string}
 */
function buildLocationHtml(locations) {
  if (!locations || !locations.length) return '';
  return locations.map(l =>
    `<div class="location-entry"><input type="text" class="loc-name" value="${l.name}"><input type="text" class="loc-address1" value="${l.address1}"><input type="text" class="loc-address2" value="${l.address2}"><input type="text" class="loc-city" value="${l.city}"><input type="text" class="loc-state" value="${l.state}"><input type="text" class="loc-zip" value="${l.zip}"></div>`
  ).join('');
}

/**
 * Builds a complete pre-populated HTML file from a SF API resource object.
 * Sets importedFileFromSFSG = true in the output HTML.
 * @param {Object} resource - The `resource` object from GET /v2/resources/:id
 * @param {string} outputFilename - Filename for the output file
 * @param {string} outputDir - Directory to write the file
 * @returns {string} The final HTML string
 */
function buildImportedOrgFile(resource, outputFilename, outputDir) {
  const buildScriptPath = path.join(__dirname, 'build-template.js');
  const tmpName = `_import_tmp_${Date.now()}.html`;
  const tmpPath = path.join(outputDir, tmpName);

  // Build blank template into temp file
  execSync(`node "${buildScriptPath}" "${tmpName}" "${outputDir}"`);
  let html = fs.readFileSync(tmpPath, 'utf8');
  fs.unlinkSync(tmpPath);

  const org = reverseTransformOrg(resource);

  // Inject org fields
  html = injectInput(html, 'organization_name', org.organization_name);
  html = injectInput(html, 'organization_alternate_name', org.organization_alternate_name);
  html = injectInput(html, 'organization_website', org.organization_website);
  html = injectInput(html, 'organization_email', org.organization_email);
  html = injectInput(html, 'organization_id', org.organization_id);
  html = injectTextarea(html, 'organization_description', org.organization_description);
  html = injectTextarea(html, 'organization_short_description', org.organization_short_description);
  html = injectTextarea(html, 'organization_internal_notes', org.organization_internal_notes);

  if (org.phones.length) {
    html = injectPhoneList(html, 'org-phone-list', buildPhoneHtml(org.phones));
  }
  if (org.locations.length) {
    html = injectLocationDiv(html, 'org-location-list', buildLocationHtml(org.locations));
  }

  // Set importedFileFromSFSG = true
  html = html.replace('let importedFileFromSFSG = false;', 'let importedFileFromSFSG = true;');

  const finalPath = path.join(outputDir, outputFilename);
  fs.writeFileSync(finalPath, html, 'utf8');
  return html;
}

module.exports = { buildImportedOrgFile, reverseTransformOrg, reverseTransformService };

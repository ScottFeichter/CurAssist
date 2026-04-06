/**
 * build-test-template.js
 *
 * 1. Calls build-template.js to produce orgServTemplate-combinedTestValues.html
 * 2. Reads that file and injects values from testOrgValues.js using inject-values.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { injectInput, injectTextarea, injectPhoneList, injectLocationDiv } = require('./inject-values');
const values = require('./testOrgValues');

const templatesDir = __dirname;
const outputName = 'orgServTemplate-combinedTestValues.html';
const outputFile = path.join(templatesDir, outputName);

// Step 1: run build-template.js to produce the blank combined file at our output path
execSync(`node "${path.join(templatesDir, 'build-template.js')}" "${outputName}" "${templatesDir}"`);

// Step 2: read and inject
let html = fs.readFileSync(outputFile, 'utf8');

const org = values.organization;

// ── Organization fields ──────────────────────────────────────────────────────

const simpleInputs = [
  'organization_name', 'organization_alternate_name',
  'organization_website', 'organization_email', 'organization_id'
];
simpleInputs.forEach(id => { html = injectInput(html, id, org[id] || ''); });

const simpleTextareas = [
  'organization_description', 'organization_short_description', 'organization_internal_notes'
];
simpleTextareas.forEach(id => { html = injectTextarea(html, id, org[id] || ''); });

// Org navbar name placeholder
html = html.replace('{{organization_name}}', org.organization_name || '');

// Org phones
if (org.phones && org.phones.length) {
  const p = org.phones[0];
  const phoneHtml = `<li data-number="${p.number}" data-ext="${p.ext}" data-vanity="${p.vanity}" data-type="${p.type}" data-description="${p.description}"><strong>${p.description}</strong> ${p.number}</li>`;
  html = injectPhoneList(html, 'org_phones', phoneHtml);
}

// Org locations
if (org.locations && org.locations.length) {
  const l = org.locations[0];
  const locationHtml = `<li data-name="${l.name}" data-address1="${l.address1}" data-address2="${l.address2}" data-city="${l.city}" data-state="${l.state}" data-zip="${l.zip}">${[l.name, l.address1, l.address2, l.city, l.state, l.zip].filter(Boolean).join(', ')}</li>`;
  html = injectLocationDiv(html, 'org_locations', locationHtml);
}

// ── Spreadsheet service fields ───────────────────────────────────────────────
// Split HTML at serviceDivSpreadsheet boundary, inject only into that section.

const svc = values.spreadsheetService;

// Find the serviceDivSpreadsheet div start and the next top-level sibling div
const svcDivStart = html.indexOf('<div class="edit--services" id="serviceDivSpreadsheet">');
const svcDivEnd = html.indexOf('<div class="edit--services" id="serviceDivOrganization">');

if (svcDivStart !== -1 && svcDivEnd !== -1) {
  let before = html.slice(0, svcDivStart);
  let svcSection = html.slice(svcDivStart, svcDivEnd);
  let after = html.slice(svcDivEnd);

  const svcInputs = ['service_name', 'service_alternate_name', 'service_email', 'service_cost', 'service_wait_time', 'service_website'];
  svcInputs.forEach(id => { svcSection = injectInput(svcSection, id, svc[id] || ''); });

  const svcTextareas = ['service_description', 'service_short_description', 'service_internal_notes', 'service_application_process', 'service_required_documents', 'service_interpretation_services', 'service_clinician_actions'];
  svcTextareas.forEach(id => { svcSection = injectTextarea(svcSection, id, svc[id] || ''); });

  svcSection = injectInput(svcSection, 'serviceBelongsToOrg', svc.service_belongs_to_org || '');

  if (svc.phones && svc.phones.length) {
    const p = svc.phones[0];
    const phoneHtml = `<li data-number="${p.number}" data-ext="${p.ext||''}" data-type="${p.type}" data-description="${p.description||''}"><strong>${p.description||''}</strong> ${p.number}</li>`;
    svcSection = injectPhoneList(svcSection, 'service_phones', phoneHtml);
  }

  if (svc.locations && svc.locations.length) {
    const l = svc.locations[0];
    const locationHtml = `<div data-name="${l.name}" data-address1="${l.address1}" data-address2="${l.address2||''}" data-city="${l.city}" data-state="${l.state}" data-zip="${l.zip}">${[l.name, l.address1, l.city, l.state, l.zip].filter(Boolean).join(', ')}</div>`;
    svcSection = injectLocationDiv(svcSection, 'service_locations', locationHtml);
  }

  html = before + svcSection + after;
}

// ── Organization services (navbar + serviceDivOrganization) ──────────────────
// The built template has serviceDivOrganization with one blank <li id="-2">.
// We work only within the org section (from serviceDivOrganization to end of file).

const orgServices = values.services;

if (orgServices && orgServices.length) {
  // Get the blank <li id="-2"> from the hidden serviceDivOrganization template
  const orgDivMarker = '<div class="edit--services" id="serviceDivOrganization">';
  const hiddenOrgDivStart = html.indexOf(orgDivMarker);

  if (hiddenOrgDivStart !== -1) {
    const orgSection = html.slice(hiddenOrgDivStart);
    const blankLiStart = orgSection.indexOf('<li id="-2" class="edit--service edit--section">');

    if (blankLiStart !== -1) {
      // Find matching </li> using nesting counter
      let depth = 0;
      let pos = blankLiStart;
      let blankLiEnd = -1;
      while (pos < orgSection.length) {
        const nextOpen = orgSection.indexOf('<li', pos + 1);
        const nextClose = orgSection.indexOf('</li>', pos + 1);
        if (nextClose === -1) break;
        if (nextOpen !== -1 && nextOpen < nextClose) {
          depth++;
          pos = nextOpen;
        } else {
          if (depth === 0) { blankLiEnd = nextClose + 5; break; }
          depth--;
          pos = nextClose;
        }
      }

      if (blankLiEnd !== -1) {
        const blankLi = orgSection.slice(blankLiStart, blankLiEnd);

        const populatedLis = orgServices.map((s, i) => {
          const serviceId = s.id || `service-org-${i}`;
          let li = blankLi.replace('id="-2"', `id="${serviceId}"`);
          li = injectInput(li, 'service_name', s.service_name || '');
          li = injectInput(li, 'service_alternate_name', s.service_alternate_name || '');
          li = injectInput(li, 'service_email', s.service_email || '');
          li = injectInput(li, 'service_cost', s.service_cost || '');
          li = injectInput(li, 'service_wait_time', s.service_wait_time || '');
          li = injectInput(li, 'service_website', s.service_website || '');
          li = injectTextarea(li, 'service_description', s.service_description || '');
          li = injectTextarea(li, 'service_short_description', s.service_short_description || '');
          li = injectTextarea(li, 'service_internal_notes', s.service_internal_notes || '');
          li = injectTextarea(li, 'service_application_process', s.service_application_process || '');
          li = injectTextarea(li, 'service_required_documents', s.service_required_documents || '');
          li = injectTextarea(li, 'service_interpretation_services', s.service_interpretation_services || '');
          li = injectTextarea(li, 'service_clinician_actions', s.service_clinician_actions || '');
          if (s.phones && s.phones.length) {
            const p = s.phones[0];
            li = injectPhoneList(li, 'service_phones', `<li data-number="${p.number}" data-ext="${p.ext||''}" data-type="${p.type}" data-description="${p.description||''}"><strong>${p.description||''}</strong> ${p.number}</li>`);
          }
          if (s.locations && s.locations.length) {
            const l = s.locations[0];
            li = injectLocationDiv(li, 'service_locations', `<div data-name="${l.name}" data-address1="${l.address1}" data-address2="${l.address2||''}" data-city="${l.city}" data-state="${l.state}" data-zip="${l.zip}">${[l.name, l.address1, l.city, l.state, l.zip].filter(Boolean).join(', ')}</div>`);
          }
          return li;
        }).join('\n');

        // Inject populated services into the orgServicesDiv container (inside edit--main)
        html = html.replace(
          '<div class="edit--orgServices" id="orgServicesDiv"></div>',
          `<div class="edit--orgServices" id="orgServicesDiv">\n` +
          populatedLis +
          `\n</div>`
        );
      }
    }
  }

  // Navbar service links
  const navLis = orgServices.map(s =>
    `<li class="app-components-edit-EditSidebar-module__listItem--HBckV" data-service-id="${s.id}"><a href="#${s.id}" setAttribute onclick="event.preventDefault(); var t=document.getElementById('${s.id}'); if(t) t.scrollIntoView({behavior:'smooth'});">${s.service_name}</a></li>`
  ).join('\n');

  html = html.replace(
    /(<ul[^>]*id="servicesList"[^>]*>)\s*(<\/ul>)/,
    `$1\n${navLis}\n$2`
  );
}

// Start sidebar open in test template (not collapsed)
html = html.replace(
  'class="app-components-edit-EditSidebar-module__sidebar--npORK collapsed" id="sidebar"',
  'class="app-components-edit-EditSidebar-module__sidebar--npORK" id="sidebar"'
);

// Fix edit--main width so it doesn't overflow the sticky sidebar
html = html.replace(
  '</head>',
  `<style>\n  .edit--main { overflow: clip; min-width: 0; }
  button.remove-item { background: transparent !important; color: #e34646 !important; border: 1px solid #e34646 !important; }\n</style>\n</head>`
);


fs.writeFileSync(outputFile, html, 'utf8');
console.log(`Test combined template created -> ${outputName}\n`);

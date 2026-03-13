/**
 * Build Test Template Script
 *
 * Takes orgServTemplate-combined.html and injects testOrgValues.js values
 * to produce orgServTemplate-combinedTestValues.html for dev/testing.
 */

const fs = require('fs');
const path = require('path');
const values = require('./testOrgValues');

const inputFile = path.join(__dirname, 'orgServTemplate-combined.html');
const outputFile = path.join(__dirname, 'orgServTemplate-combinedTestValues.html');

let html = fs.readFileSync(inputFile, 'utf8');

// --- Org field helpers ---
function setInputValue(html, id, value) {
  return html.replace(
    new RegExp(`(id="${id}"[^>]*?)value="[^"]*"`, 'g'),
    `$1value="${escHtml(value)}"`
  );
}

function setTextarea(html, id, value) {
  return html.replace(
    new RegExp(`(<textarea[^>]*id="${id}"[^>]*>)[^<]*(</textarea>)`, 'g'),
    `$1${escHtml(value)}$2`
  );
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const org = values.organization;

// Org inputs
html = setInputValue(html, 'organization_name', org.organization_name);
html = setInputValue(html, 'organization_alternate_name', org.organization_alternate_name);
html = setInputValue(html, 'organization_website', org.organization_website);
html = setInputValue(html, 'organization_email', org.organization_email);
html = setInputValue(html, 'organization_id', org.organization_id);

// Org textareas
html = setTextarea(html, 'organization_description', org.organization_description);
html = setTextarea(html, 'organization_short_description', org.organization_short_description);
html = setTextarea(html, 'organization_internal_notes', org.organization_internal_notes);

// Org navbar link placeholder
html = html.replace('{{organization_name}}', escHtml(org.organization_name));

// --- Org phones ---
const orgPhoneLis = org.phones.map(p => `<li
  data-number="${escHtml(p.number)}"
  data-ext="${escHtml(p.ext)}"
  data-vanity="${escHtml(p.vanity)}"
  data-type="${escHtml(p.type)}"
  data-description="${escHtml(p.description)}"
>${escHtml(p.number)}${p.ext ? ' x' + p.ext : ''}${p.description ? ' — ' + p.description : ''}</li>`).join('\n');

html = html.replace(
  /(<ul[^>]*id="org_phones"[^>]*>)\s*(<\/ul>)/,
  `$1\n${orgPhoneLis}\n$2`
);

// --- Org locations ---
const orgLocationLis = org.locations.map(l => `<li
  data-name="${escHtml(l.name)}"
  data-address1="${escHtml(l.address1)}"
  data-address2="${escHtml(l.address2)}"
  data-city="${escHtml(l.city)}"
  data-state="${escHtml(l.state)}"
  data-zip="${escHtml(l.zip)}"
>${escHtml([l.name, l.address1, l.address2, l.city, l.state, l.zip].filter(Boolean).join(', '))}</li>`).join('\n');

html = html.replace(
  /(<ul[^>]*id="org_locations"[^>]*>)\s*(<\/ul>)/,
  `$1\n${orgLocationLis}\n$2`
);

// --- Org hours: set time input values for each day ---
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
days.forEach(day => {
  const h = org.hours[day];
  if (!h) return;
  // Each day row has two time inputs in order; use a counter approach via split/replace
  const dayPattern = new RegExp(
    `(data-day="${day}"[\\s\\S]*?<div class="time-input-wrap"><input type="time" )value="[^"]*"([\\s\\S]*?<div class="time-input-wrap"><input type="time" )value="[^"]*"`,
    'g'
  );
  html = html.replace(dayPattern, `$1value="${h.open}"$2value="${h.close}"`);
});

// --- Services in orgServicesDiv ---
// Build service divs from the serviceDivOrganization template clone approach:
// We'll inject a pre-built service HTML block for each test service.

function buildServiceDiv(svc) {
  const phones = svc.phones.map(p => `<li
    data-number="${escHtml(p.number)}"
    data-ext="${escHtml(p.ext || '')}"
    data-type="${escHtml(p.type)}"
    data-description="${escHtml(p.description || '')}"
  >${escHtml(p.number)}</li>`).join('\n');

  const locations = svc.locations.map(l => `<li
    data-name="${escHtml(l.name)}"
    data-address1="${escHtml(l.address1)}"
    data-address2="${escHtml(l.address2 || '')}"
    data-city="${escHtml(l.city)}"
    data-state="${escHtml(l.state)}"
    data-zip="${escHtml(l.zip)}"
  >${escHtml([l.name, l.address1, l.city, l.state].filter(Boolean).join(', '))}</li>`).join('\n');

  return `<div class="edit--services" id="${svc.id}">
  <input id="service_internal_notes" type="hidden" value="${escHtml(svc.service_internal_notes)}">
  <input id="service_name" type="text" value="${escHtml(svc.service_name)}">
  <input id="service_alternate_name" type="text" value="${escHtml(svc.service_alternate_name)}">
  <input id="service_email" type="email" value="${escHtml(svc.service_email)}">
  <input id="service_belongs_to_org" type="text" value="${escHtml(svc.service_belongs_to_org)}">
  <textarea id="service_description">${escHtml(svc.service_description)}</textarea>
  <textarea id="service_short_description">${escHtml(svc.service_short_description)}</textarea>
  <ul id="service_phones">${phones}</ul>
  <div id="service_locations">${locations}</div>
</div>`;
}

const serviceDivs = values.services.map(buildServiceDiv).join('\n');

// Inject into orgServicesDiv
html = html.replace(
  /(<div[^>]*id="orgServicesDiv"[^>]*>)\s*(<\/div>)/,
  `$1${serviceDivs}$2`
);

// --- Navbar service links ---
const navLis = values.services.map(svc =>
  `<li class="app-components-edit-EditSidebar-module__listItem--HBckV" data-service-id="${svc.id}"><a href="#${svc.id}" onclick="event.preventDefault(); var t=document.getElementById('${svc.id}'); if(t) t.scrollIntoView({behavior:'smooth'});">${escHtml(svc.service_name)}</a></li>`
).join('\n');

html = html.replace(
  /(<ul[^>]*id="servicesList"[^>]*>)\s*(<\/ul>)/,
  `$1\n${navLis}\n$2`
);

fs.writeFileSync(outputFile, html, 'utf8');
console.log(`✓ Test values template created: ${outputFile}`);

/**
 * import-org.js
 *
 * Reverse-transforms a SF API GET /v2/resources/:id response into inject-values shape,
 * builds a pre-populated HTML file from the template, and sets importedFileFromSFSG = true.
 */

const path = require('path');
const { execSync } = require('child_process');
const fs = require('fs');
const { injectInput, injectTextarea } = require('./inject-values');

// Day order matches the 7 positional .day-group divs in the template (M, T, W, Th, F, S, Su)
const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function intToTime(n) {
  if (!n && n !== 0) return '';
  const s = String(n).padStart(4, '0');
  return `${s.slice(0, 2)}:${s.slice(2)}`;
}

function reverseTransformOrg(resource) {
  const scheduleDays = (resource.schedule && resource.schedule.schedule_days) || [];
  const hoursMap = {};
  scheduleDays.forEach(d => {
    hoursMap[d.day] = { open: intToTime(d.opens_at), close: intToTime(d.closes_at) };
  });

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
      .map(p => ({ number: p.number || '', ext: p.extension || '', description: p.service_type || '' })),
    locations: (resource.addresses || []).map(a => ({
      name: a.name || '',
      address1: a.address_1 || '',
      address2: a.address_2 || '',
      city: a.city || '',
      state: a.state_province || '',
      zip: a.postal_code || ''
    })),
    hours: DAY_ORDER.map(day => hoursMap[day] || { open: '', close: '' })
  };
}

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
    categories: (svc.categories || []),
    eligibilities: (svc.eligibilities || [])
  };
}

/**
 * Builds the inline <script> block that populates phones, locations, hours, and services
 * at DOMContentLoaded time using the same DOM APIs the template already uses.
 */
function buildPopulateScript(org, services) {
  const phonesJson = JSON.stringify(org.phones);
  const locationsJson = JSON.stringify(org.locations);
  const hoursJson = JSON.stringify(org.hours);
  const servicesJson = JSON.stringify(services);

  return `
<script id="importPopulateScript">
(function() {
  var phones = ${phonesJson};
  var locations = ${locationsJson};
  var hours = ${hoursJson};
  var services = ${servicesJson};

  function populate() {
    // Phones
    var phoneSublist = document.getElementById('organization_phones');
    if (phoneSublist) {
      phones.forEach(function(p, i) {
        if (i > 0) {
          var hr = document.createElement('li');
          hr.style.cssText = 'list-style:none;border-top:1px solid #ddd;margin:6px 0;padding:0;';
          phoneSublist.appendChild(hr);
        }
        var li = document.createElement('li');
        li.innerHTML = '<strong>' + (p.description || '') + ':</strong> ' + p.number + (p.ext ? ' x' + p.ext : '');
        phoneSublist.appendChild(li);
      });
    }

    // Locations
    var locationList = document.getElementById('organization_locations');
    if (locationList) {
      locations.forEach(function(l, i) {
        if (i > 0) {
          var sep = document.createElement('div');
          sep.style.cssText = 'border-top:1px solid #ddd;margin:8px 0;';
          locationList.appendChild(sep);
        }
        var div = document.createElement('div');
        div.innerHTML = '<strong>' + l.name + '</strong><br>' + l.address1 + (l.address2 ? '<br>' + l.address2 : '') + '<br>' + l.city + ', ' + l.state + ' ' + l.zip;
        locationList.appendChild(div);
      });
    }

    // Hours — 7 positional .day-group divs (M, T, W, Th, F, S, Su)
    var dayGroups = document.querySelectorAll('.day-group');
    hours.forEach(function(h, i) {
      if (!dayGroups[i]) return;
      var inputs = dayGroups[i].querySelectorAll('input[type="time"]');
      if (inputs[0]) inputs[0].value = h.open;
      if (inputs[1]) inputs[1].value = h.close;
    });

    // Services — call addNewService() for each, then populate the cloned div's fields
    if (typeof window.addNewService === 'function') {
      services.forEach(function(svc) {
        window.addNewService();
        var orgServicesDiv = document.getElementById('orgServicesDiv');
        if (!orgServicesDiv) return;
        var newDiv = orgServicesDiv.lastElementChild;
        if (!newDiv) return;

        // Populate text fields and trigger input event so navbar link updates
        var fields = [
          'service_name', 'service_alternate_name', 'service_email', 'service_website',
          'service_description', 'service_short_description', 'service_application_process',
          'service_required_documents', 'service_interpretation_services',
          'service_cost', 'service_wait_time', 'service_internal_notes'
        ];
        fields.forEach(function(f) {
          var el = newDiv.querySelector('#' + f);
          if (el && svc[f] !== undefined) {
            el.value = svc[f];
            el.dispatchEvent(new Event('input'));
          }
        });

        // Inject category/eligibility pills into the Select-multi-value-wrapper
        function addPills(dropdownId, names) {
          if (!names || !names.length) return;
          var input = newDiv.querySelector('#' + dropdownId);
          if (!input) return;
          var wrapper = input.closest('.Select-multi-value-wrapper');
          if (!wrapper) return;
          var placeholder = wrapper.querySelector('.Select-placeholder');
          if (placeholder) placeholder.style.display = 'none';
          names.forEach(function(name) {
            var pill = document.createElement('div');
            pill.className = 'Select-value';
            pill.innerHTML = '<span class="Select-value-icon" aria-hidden="true">\u00d7</span><span class="Select-value-label">' + name + '</span>';
            pill.querySelector('.Select-value-icon').addEventListener('click', function() {
              pill.remove();
              if (!wrapper.querySelector('.Select-value') && placeholder) placeholder.style.display = 'block';
            });
            wrapper.insertBefore(pill, input.parentElement);
          });
        }

        if (svc.categories && svc.categories.length) {
          var topCats = svc.categories.filter(function(c) { return c.top_level; }).map(function(c) { return c.name; });
          var subCats = svc.categories.filter(function(c) { return !c.top_level; }).map(function(c) { return c.name; });
          addPills('categoryTopDropdown', topCats);
          addPills('categorySubDropdown', subCats);
        }
        if (svc.eligibilities && svc.eligibilities.length) {
          var topElig = svc.eligibilities.filter(function(e) { return e.feature_rank !== null; }).map(function(e) { return e.name; });
          var subElig = svc.eligibilities.filter(function(e) { return e.feature_rank === null; }).map(function(e) { return e.name; });
          addPills('eligibilityTopDropdown', topElig);
          addPills('eligibilitySubDropdown', subElig);
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', populate);
  } else {
    populate();
  }
})();
</script>`;
}

function buildImportedOrgFile(resource, outputFilename, outputDir) {
  const buildScriptPath = path.join(__dirname, 'build-template.js');
  const tmpName = `_import_tmp_${Date.now()}.html`;
  const tmpPath = path.join(outputDir, tmpName);

  execSync(`node "${buildScriptPath}" "${tmpName}" "${outputDir}"`);
  let html = fs.readFileSync(tmpPath, 'utf8');
  fs.unlinkSync(tmpPath);

  const org = reverseTransformOrg(resource);
  const services = (resource.services || [])
    .filter(s => s.name)
    .map(s => reverseTransformService(s, resource.id));

  // Inject simple text fields
  html = injectInput(html, 'organization_name', org.organization_name);
  html = injectInput(html, 'organization_alternate_name', org.organization_alternate_name);
  html = injectInput(html, 'organization_website', org.organization_website);
  html = injectInput(html, 'organization_email', org.organization_email);
  html = injectInput(html, 'organization_id', org.organization_id);
  html = injectTextarea(html, 'organization_description', org.organization_description);
  html = injectTextarea(html, 'organization_short_description', org.organization_short_description);
  html = injectTextarea(html, 'organization_internal_notes', org.organization_internal_notes);

  // Set importedFileFromSFSG flag
  html = html.replace('let importedFileFromSFSG = false;', 'let importedFileFromSFSG = true;');

  // Inject populate script just before </body>
  html = html.replace('</body>', buildPopulateScript(org, services) + '\n</body>');

  const finalPath = path.join(outputDir, outputFilename);
  fs.writeFileSync(finalPath, html, 'utf8');
  return html;
}

module.exports = { buildImportedOrgFile, reverseTransformOrg, reverseTransformService };

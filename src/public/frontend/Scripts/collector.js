// ============================================================
// COLLECTOR — reads iframe DOM and assembles submit payload
// ============================================================

// #region ===================== HELPERS ========================================

/**
 * Returns an element by id from either a Document or an Element root.
 * @param {Document|Element} root
 * @param {string} id
 * @returns {Element|null}
 */
function getEl(root, id) {
  return root.getElementById ? root.getElementById(id) : root.querySelector('#' + id);
}

/**
 * Returns the trimmed value of an element by id.
 * @param {Document|Element} root
 * @param {string} id
 * @returns {string}
 */
function val(root, id) {
  const el = getEl(root, id);
  return el ? el.value.trim() : '';
}

/**
 * Collects location entries from a container element's children via data attributes.
 * @param {Document|Element} root
 * @param {string} id
 * @returns {{ location_name: string, address_1: string, address_2: string, city: string, state: string, zip: string }[]}
 */
function collectLocations(root, id) {
  const container = getEl(root, id);
  if (!container) return [];
  return Array.from(container.children)
    .map(div => ({
      location_name: div.dataset.name  || '',
      address_1:     div.dataset.addr1 || '',
      address_2:     div.dataset.addr2 || '',
      city:          div.dataset.city  || '',
      state:         div.dataset.state || '',
      zip:           div.dataset.zip   || ''
    }))
    .filter(loc => loc.location_name || loc.address_1 || loc.city);
}

/**
 * Collects phone entries from a container element's children via data attributes.
 * @param {Document|Element} root
 * @param {string} id
 * @returns {{ phone_name: string, phone_number: string }[]}
 */
function collectPhones(root, id) {
  const container = getEl(root, id);
  if (!container) return [];
  return Array.from(container.children).map(li => ({
    phone_name:   li.dataset.name   || '',
    phone_number: li.dataset.number || ''
  }));
}

/**
 * Collects note text from a container element's children.
 * @param {Document|Element} root
 * @param {string} id
 * @returns {string[]}
 */
function collectNotes(root, id) {
  const container = getEl(root, id);
  if (!container) return [];
  return Array.from(container.children).map(li => li.textContent.trim()).filter(Boolean);
}

/**
 * Collects pill/tag label text from Select-value-label elements.
 * @param {Document|Element} root
 * @param {string} id
 * @returns {string[]}
 */
function collectPills(root, id) {
  const container = getEl(root, id);
  if (!container) return [];
  return Array.from(container.querySelectorAll('.Select-value-label')).map(el => el.textContent.trim());
}

/**
 * Collects hours from all .day-group elements in the root.
 * @param {Document|Element} root
 * @returns {Object.<string, { start: { time: string, meridiem: string }, end: { time: string, meridiem: string } }>}
 */
function collectHours(root) {
  const dayKeys = ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'];
  const groups = root.querySelectorAll('.day-group');
  const hours = {};
  dayKeys.forEach((key, i) => {
    const group = groups[i];
    const inputs = group ? group.querySelectorAll('input[type="time"]') : [];
    const startRaw = inputs[0] ? inputs[0].value : '';
    const endRaw   = inputs[1] ? inputs[1].value : '';
    hours[key] = {
      start: { time: startRaw, meridiem: deriveMeridiem(startRaw) },
      end:   { time: endRaw,   meridiem: deriveMeridiem(endRaw)   }
    };
  });
  return hours;
}

/**
 * Derives AM/PM from a 24h time string.
 * @param {string} timeStr
 * @returns {string}
 */
function deriveMeridiem(timeStr) {
  if (!timeStr) return '';
  const hh = parseInt(timeStr.split(':')[0], 10);
  return hh < 12 ? 'AM' : 'PM';
}

// #endregion ------------------------------------------------------------------

// #region ===================== COLLECT =======================================

/**
 * Collects all service fields from a root element or document.
 * @param {Document|Element} root
 * @returns {Object}
 */
function collectService(root) {
  return {
    service_internal_notes:        val(root, 'service_internal_notes'),
    service_name:                  val(root, 'service_name'),
    service_alternate_name:        val(root, 'service_alternate_name'),
    service_email:                 val(root, 'service_email'),
    service_description:           val(root, 'service_description'),
    service_short_description:     val(root, 'service_short_description'),
    service_application_process:   val(root, 'service_application_process'),
    service_required_documents:    val(root, 'service_required_documents'),
    service_interpretation_services: val(root, 'service_interpretation_services'),
    service_clinician_actions:     val(root, 'service_clinician_actions'),
    service_cost:                  val(root, 'service_cost'),
    service_wait_time:             val(root, 'service_wait_time'),
    service_website:               val(root, 'service_website'),
    service_locations:             collectLocations(root, 'service_locations'),
    service_phones:                collectPhones(root, 'service_phones'),
    service_hours:                 collectHours(root),
    service_top_eligibilities:     collectPills(root, 'service_top_eligibilities'),
    service_sub_eligibilities:     collectPills(root, 'service_sub_eligibilities'),
    service_top_categories:        collectPills(root, 'service_top_categories'),
    service_sub_categories:        collectPills(root, 'service_sub_categories'),
    service_markdown_notes:        collectNotes(root, 'service_markdown_notes')
  };
}

/**
 * Collects all organization fields and nested services from the iframe document.
 * @param {Document} root
 * @returns {Object}
 */
function collectOrganization(root) {
  const org = {
    organization_internal_notes: val(root, 'organization_internal_notes'),
    organization_name:           val(root, 'organization_name'),
    organization_alternate_name: val(root, 'organization_alternate_name'),
    organization_website:        val(root, 'organization_website'),
    organization_email:          val(root, 'organization_email'),
    organization_description:    val(root, 'organization_description'),
    organization_legal_status:   val(root, 'organization_legal_status'),
    organization_locations:      collectLocations(root, 'organization_locations'),
    organization_phones:         collectPhones(root, 'organization_phones'),
    organization_markdown_notes: collectNotes(root, 'organization_markdown_notes'),
    services: {}
  };

  const orgServicesDiv = root.getElementById('orgServicesDiv');
  if (orgServicesDiv) {
    Array.from(orgServicesDiv.children).forEach((serviceEl, i) => {
      org.services[`service_${i + 1}`] = collectService(serviceEl);
    });
  }

  return org;
}

/**
 * Determines org vs service mode from the active toggle button and collects the appropriate payload.
 * @returns {{ organization: Object }|{ service: Object }}
 */
function collectFormData() {
  const iframeWin = document.getElementById('formFrame').contentWindow;
  const iframeDoc = iframeWin.document;
  const isOrg = !!iframeDoc.getElementById('OrganizationButton')?.classList.contains('active');

  if (!isOrg) {
    const service = collectService(iframeDoc);
    service.service_belongs_to_org = val(iframeDoc, 'serviceBelongsToOrg');
    return { service };
  }

  return { organization: collectOrganization(iframeDoc) };
}

// #endregion ------------------------------------------------------------------

// #region ===================== SUBMIT ========================================

/**
 * Saves the file, collects form data, submits to SF API, and moves file to Complete on success.
 * @returns {Promise<void>}
 */
async function submitFormData() {
  console.log('[SUBMIT] submitFormData called');
  const saved = await saveFile(true);
  console.log('[SUBMIT] saveFile result:', saved);
  if (!saved) {
    document.getElementById('submitResultMessage').innerHTML = 'Save failed — submission cancelled.';
    document.getElementById('submitResultModal').style.display = 'block';
    return;
  }

  const payload = collectFormData();
  const orgId = currentFiles[currentIndex]._id;
  console.log('[SUBMIT] 1. Payload collected:', JSON.stringify(payload, null, 2));
  console.log('[SUBMIT] 2. Mode:', payload.organization ? 'Organization' : 'Service');
  console.log('[SUBMIT] 3. Atlas org _id:', orgId);
  let sfId = null;

  try {
    if (payload.organization) {
      console.log('[SUBMIT] 4. Calling submitNewOrg...');
      sfId = await submitNewOrg(payload);
      console.log('[SUBMIT] 5. submitNewOrg succeeded, sfId:', sfId);
    } else {
      console.log('[SUBMIT] 4. Calling submitService...');
      await submitService(payload);
      console.log('[SUBMIT] 5. submitService succeeded');
    }
  } catch (err) {
    console.log('[SUBMIT] ERROR in submit:', err.message);
    document.getElementById('submitResultMessage').innerHTML = 'File saved successfully.<br><br>Submission failed: ' + err.message;
    document.getElementById('submitResultModal').style.display = 'block';
    return;
  }

  // Write sfId back to Atlas and move to complete
  const moveResponse = await fetch(`${API_BASE}/buckets/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'XSRF-Token': getCsrfToken() },
    credentials: 'include',
    body: JSON.stringify({ id: orgId, sfId })
  });
  console.log('[SUBMIT] 6. Atlas submit response status:', moveResponse.status);

  const sfIdLine = sfId ? `<br><br>New Org ID: <strong>${sfId}</strong>` : '';
  if (moveResponse.ok) {
    document.getElementById('submitResultMessage').innerHTML = `File saved and submitted successfully.<br><br>Moved to Complete.${sfIdLine}`;
  } else {
    document.getElementById('submitResultMessage').innerHTML = `Submitted successfully but failed to update record.${sfIdLine}`;
  }
  document.getElementById('submitResultModal').style.display = 'block';
}

// #endregion ------------------------------------------------------------------

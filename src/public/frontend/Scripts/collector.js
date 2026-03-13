// ============================================================
// COLLECTOR — reads iframe DOM and assembles submit payload
// ============================================================

// #region ===================== HELPERS ========================================

function val(root, id) {
  const el = root.getElementById(id);
  return el ? el.value.trim() : '';
}

function collectLocations(root, id) {
  const container = root.getElementById(id);
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

function collectPhones(root, id) {
  const container = root.getElementById(id);
  if (!container) return [];
  return Array.from(container.children).map(li => ({
    phone_name:   li.dataset.name   || '',
    phone_number: li.dataset.number || ''
  }));
}

function collectNotes(root, id) {
  const container = root.getElementById(id);
  if (!container) return [];
  return Array.from(container.children).map(li => li.textContent.trim()).filter(Boolean);
}

function collectPills(root, id) {
  const container = root.getElementById(id);
  if (!container) return [];
  return Array.from(container.querySelectorAll('.Select-value-label')).map(el => el.textContent.trim());
}

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

function deriveMeridiem(timeStr) {
  if (!timeStr) return '';
  const hh = parseInt(timeStr.split(':')[0], 10);
  return hh < 12 ? 'AM' : 'PM';
}

// #endregion ------------------------------------------------------------------

// #region ===================== COLLECT =======================================

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

function collectFormData() {
  const iframeWin = document.getElementById('formFrame').contentWindow;
  const iframeDoc = iframeWin.document;
  const isOrg = iframeWin.Organization === true;

  if (!isOrg) {
    const service = collectService(iframeDoc);
    service.service_belongs_to_org = val(iframeDoc, 'service_belongs_to_org');
    return { service };
  }

  return { organization: collectOrganization(iframeDoc) };
}

// #endregion ------------------------------------------------------------------

// #region ===================== SUBMIT ========================================

async function submitFormData() {
  const payload = collectFormData();
  console.log('Submit payload:', JSON.stringify(payload, null, 2));

  try {
    if (payload.organization) {
      await submitNewOrg(payload);
    } else {
      await submitService(payload);
    }
  } catch (err) {
    alert('Submission failed: ' + err.message);
    return;
  }

  // Move file to Complete
  const filename = currentFiles[currentIndex];
  const moveResponse = await fetch(`${API_BASE}/buckets/move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'XSRF-Token': getCsrfToken() },
    credentials: 'include',
    body: JSON.stringify({ fromBucket: currentBucket, fromSubdir: currentSubdir, toBucket: currentBucket, toSubdir: 'Complete', filename })
  });

  if (moveResponse.ok) {
    document.getElementById('submitSuccessModal').style.display = 'block';
  } else {
    alert('Submission succeeded but failed to move file to Complete');
  }
}

// #endregion ------------------------------------------------------------------

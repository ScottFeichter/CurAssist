// #region ===================== SUBMIT FLOW ===================================

function submitFile() {
  if (!currentFiles[currentIndex]) { alert('No file selected'); return; }
  if (currentSubdir === 'Complete') {
    document.getElementById('alreadyCompleteModal').style.display = 'block';
    return;
  }
  const iframe = document.getElementById('formFrame');
  const sfsgIdEl = iframe.contentDocument?.getElementById('organization_sfsg_id');
  const sfsgId = sfsgIdEl ? sfsgIdEl.value.trim() : 'TBD';
  if (sfsgId && sfsgId !== 'TBD') {
    document.getElementById('submitWarnSfsgId').textContent = sfsgId;
    document.getElementById('submitWarnModal').style.display = 'block';
    return;
  }
  document.getElementById('submitModal').style.display = 'block';
}

function confirmSubmit() {
  document.getElementById('submitWorking').textContent = 'Working...';
  document.getElementById('submitWorking').style.display = 'block';
  submitFormData('new').finally(() => {
    document.getElementById('submitModal').style.display = 'none';
    document.getElementById('submitWorking').style.display = 'none';
  });
}

function cancelSubmit() {
  document.getElementById('submitModal').style.display = 'none';
}

function confirmSubmitUpdate() {
  document.getElementById('submitWarnWorking').textContent = 'Working...';
  document.getElementById('submitWarnWorking').style.display = 'block';
  submitFormData('update').finally(() => {
    document.getElementById('submitWarnModal').style.display = 'none';
    document.getElementById('submitWarnWorking').style.display = 'none';
  });
}

function confirmSubmitNew() {
  document.getElementById('submitWarnWorking').textContent = 'Working...';
  document.getElementById('submitWarnWorking').style.display = 'block';
  submitFormData('new').finally(() => {
    document.getElementById('submitWarnModal').style.display = 'none';
    document.getElementById('submitWarnWorking').style.display = 'none';
  });
}

function cancelSubmitWarn() {
  document.getElementById('submitWarnModal').style.display = 'none';
}

function onSubmitResultOk() {
  document.getElementById('submitResultModal').style.display = 'none';
  reloadSubdirNoLoad();
}

/**
 * Saves the file, collects form data, submits to SF API, and moves file to Complete on success.
 * @param {'new'|'update'} [mode='new']
 * @returns {Promise<void>}
 */
async function submitFormData(mode = 'new') {
  const saved = await saveFile(true);
  if (!saved) {
    document.getElementById('submitResultMessage').innerHTML = 'Save failed — submission cancelled.';
    document.getElementById('submitResultModal').style.display = 'block';
    return;
  }

  const payload = collectFormData();
  const orgId = currentFiles[currentIndex]._id;
  let sfsg_id = null;

  try {
    if (payload.organization && mode === 'update') {
      const iframeDoc = document.getElementById('formFrame').contentDocument;
      const existingSfsgId = iframeDoc?.getElementById('organization_sfsg_id')?.value?.trim();
      sfsg_id = await submitUpdateOrg(payload, existingSfsgId);
    } else if (payload.organization) {
      sfsg_id = await submitNewOrg(payload);
    } else {
      await submitService(payload);
    }
  } catch (err) {
    document.getElementById('submitResultMessage').innerHTML = 'File saved successfully.<br><br>Submission failed: ' + err.message;
    document.getElementById('submitResultModal').style.display = 'block';
    return;
  }

  const moveResponse = await fetch(`${API_BASE}/buckets/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'XSRF-Token': getCsrfToken() },
    credentials: 'include',
    body: JSON.stringify({ id: orgId, sfsg_id })
  });

  const sfIdLine = sfsg_id ? `<br><br>New Org ID: <strong>${sfsg_id}</strong>` : '';
  if (moveResponse.ok) {
    document.getElementById('submitResultMessage').innerHTML = `File saved and submitted successfully.<br><br>Moved to Complete.${sfIdLine}`;
  } else {
    document.getElementById('submitResultMessage').innerHTML = `Submitted successfully but failed to update record.${sfIdLine}`;
  }
  document.getElementById('submitResultModal').style.display = 'block';
}

// #endregion ------------------------------------------------------------------

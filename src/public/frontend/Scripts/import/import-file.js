// #region ===================== IMPORT FILE ===================================

async function importFile() {
  document.getElementById('importFileError').textContent = '';
  const bucketSel = document.getElementById('importFileBucket');
  bucketSel.innerHTML = '<option value="">Select bucket...</option>';
  document.getElementById('importFileSubdir').innerHTML = '<option value="">Select subdirectory...</option>';

  const buckets = await fetch('/api/buckets').then(r => r.json()).catch(() => []);
  buckets.forEach(b => {
    const opt = document.createElement('option');
    opt.value = b; opt.textContent = b;
    bucketSel.appendChild(opt);
  });

  document.getElementById('importFileModal').style.display = 'block';
}

async function onImportFileBucketChange() {
  const bucket = document.getElementById('importFileBucket').value;
  const subdirSel = document.getElementById('importFileSubdir');
  subdirSel.innerHTML = '<option value="">Select subdirectory...</option>';
  if (!bucket) return;
  const subdirs = await fetch(`/api/buckets/${encodeURIComponent(bucket)}/subdirs`).then(r => r.json()).catch(() => []);
  subdirs.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s; opt.textContent = s;
    subdirSel.appendChild(opt);
  });
}

async function confirmImportFile() {
  const orgId = document.getElementById('importOrgId').value.trim();
  const bucket = document.getElementById('importFileBucket').value;
  const subdir = document.getElementById('importFileSubdir').value;
  const errEl = document.getElementById('importFileError');
  errEl.textContent = '';

  if (!orgId || !bucket || !subdir) {
    errEl.textContent = 'Org ID, bucket, and subdirectory are required.';
    return;
  }

  document.getElementById('importFileWorking').textContent = 'Working...';
  document.getElementById('importFileWorking').style.display = 'block';

  const res = await fetch('/api/buckets/import-file', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'XSRF-Token': getCsrfToken() },
    body: JSON.stringify({ orgId, bucket, subdir })
  });

  document.getElementById('importFileModal').style.display = 'none';
  document.getElementById('importFileWorking').style.display = 'none';
  const msgEl = document.getElementById('importResultMessage');

  let data;
  try {
    data = await res.json();
  } catch (e) {
    msgEl.innerHTML = `Import failed.<br>Server error (${res.status}).`;
    document.getElementById('importResultModal').style.display = 'block';
    return;
  }

  if (res.status === 409 && data.duplicate) {
    document.getElementById('importDuplicateMessage').textContent =
      `An org named "${data.existingName}" already exists in this bucket. What would you like to do?`;
    document.getElementById('importDuplicateOverwrite').checked = false;
    document.getElementById('importDuplicateRename').checked = false;
    document.getElementById('importDuplicateNewName').style.display = 'none';
    document.getElementById('importDuplicateNewName').value = '';
    document.getElementById('importDuplicateError').textContent = '';
    window._importDuplicateContext = { bucket, subdir, existingId: data.existingId, resource: data.resource };
    document.getElementById('importDuplicateModal').style.display = 'block';
    return;
  }

  if (!res.ok || !data.success) {
    msgEl.innerHTML = `Import failed.<br>${data.error || 'Unknown error.'}`;
  } else {
    msgEl.innerHTML = `File successfully imported to<br><br>Bucket: ${bucket}<br>Subdirectory: ${subdir}`;
    if (currentBucket === bucket && currentSubdir === subdir) {
      await loadSubdir();
    }
  }

  document.getElementById('importResultModal').style.display = 'block';
}

function cancelImportFile() {
  document.getElementById('importFileModal').style.display = 'none';
}

document.addEventListener('change', function(e) {
  if (e.target.name === 'importDuplicateAction') {
    const nameInput = document.getElementById('importDuplicateNewName');
    nameInput.style.display = e.target.value === 'rename' ? 'block' : 'none';
  }
});

async function confirmImportDuplicate() {
  const action   = document.querySelector('input[name="importDuplicateAction"]:checked')?.value;
  const newName  = document.getElementById('importDuplicateNewName').value.trim();
  const errEl    = document.getElementById('importDuplicateError');
  const ctx      = window._importDuplicateContext;
  errEl.textContent = '';

  if (!action)                          { errEl.textContent = 'Please select an option.'; return; }
  if (action === 'rename' && !newName)  { errEl.textContent = 'Please enter a new name.'; return; }

  document.getElementById('importDuplicateWorking').textContent = 'Working...';
  document.getElementById('importDuplicateWorking').style.display = 'block';

  const res = await fetch(`${API_BASE}/buckets/import-file-resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'XSRF-Token': getCsrfToken() },
    credentials: 'include',
    body: JSON.stringify({ bucket: ctx.bucket, subdir: ctx.subdir, existingId: ctx.existingId, action, newName, resource: ctx.resource })
  });

  const msgEl = document.getElementById('importResultMessage');
  let data;
  try { data = await res.json(); } catch (e) {
    document.getElementById('importDuplicateModal').style.display = 'none';
    document.getElementById('importDuplicateWorking').style.display = 'none';
    msgEl.innerHTML = `Import failed.<br>Server error (${res.status}).`;
    document.getElementById('importResultModal').style.display = 'block';
    return;
  }

  if (!res.ok || !data.success) {
    msgEl.innerHTML = `Import failed.<br>${data.error || 'Unknown error.'}`;
  } else {
    msgEl.innerHTML = `File successfully imported to<br><br>Bucket: ${ctx.bucket}<br>Subdirectory: ${ctx.subdir}`;
    if (currentBucket === ctx.bucket && currentSubdir === ctx.subdir) await loadSubdir();
  }
  document.getElementById('importDuplicateModal').style.display = 'none';
  document.getElementById('importDuplicateWorking').style.display = 'none';
  document.getElementById('importResultModal').style.display = 'block';
}

// #endregion ------------------------------------------------------------------

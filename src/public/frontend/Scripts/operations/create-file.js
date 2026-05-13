// #region ===================== CREATE FILE ===================================

async function createFile() {
  const buckets = await fetch(`${API_BASE}/buckets`).then(r => r.json());
  const destBucket = document.getElementById('createFileBucket');
  const fromBucket = document.getElementById('createFileFromBucket');
  [destBucket, fromBucket].forEach(sel => {
    sel.innerHTML = '<option value="">Select bucket...</option>';
    buckets.forEach(b => {
      const opt = document.createElement('option');
      opt.value = b; opt.textContent = b;
      sel.appendChild(opt);
    });
  });

  if (currentBucket) {
    destBucket.value = currentBucket;
    await onCreateFileBucketChange();
  }

  document.getElementById('createFileName').value = '';
  document.getElementById('createFileFromSubdir').innerHTML = '<option value="">Select source subdirectory...</option>';
  document.getElementById('createFileFromFile').innerHTML = '<option value="">Select source file...</option>';
  document.getElementById('createFileModal').style.display = 'block';
}

async function onCreateFileBucketChange() {
  const bucket = document.getElementById('createFileBucket').value;
  const subdirSel = document.getElementById('createFileSubdir');
  subdirSel.innerHTML = '<option value="">Select subdirectory...</option>';
  if (!bucket) return;
  const subdirs = await fetch(`${API_BASE}/buckets/${bucket}/subdirs`).then(r => r.json());
  subdirs.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s; opt.textContent = s;
    subdirSel.appendChild(opt);
  });
  if (currentSubdir) subdirSel.value = currentSubdir;
}

async function onCreateFileFromBucketChange() {
  const bucket = document.getElementById('createFileFromBucket').value;
  const subdirSel = document.getElementById('createFileFromSubdir');
  subdirSel.innerHTML = '<option value="">Select source subdirectory...</option>';
  document.getElementById('createFileFromFile').innerHTML = '<option value="">Select source file...</option>';
  if (!bucket) return;
  const subdirs = await fetch(`${API_BASE}/buckets/${bucket}/subdirs`).then(r => r.json());
  subdirs.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s; opt.textContent = s;
    subdirSel.appendChild(opt);
  });
}

async function onCreateFileFromSubdirChange() {
  const bucket = document.getElementById('createFileFromBucket').value;
  const subdir = document.getElementById('createFileFromSubdir').value;
  const fileSel = document.getElementById('createFileFromFile');
  fileSel.innerHTML = '<option value="">Select source file...</option>';
  if (!bucket || !subdir) return;
  const files = await fetch(`${API_BASE}/buckets/${bucket}/${subdir}/files`).then(r => r.json());
  files.forEach(f => {
    const opt = document.createElement('option');
    opt.value = f._id;
    opt.textContent = f.name;
    fileSel.appendChild(opt);
  });
}

async function confirmCreateFile() {
  const filename = document.getElementById('createFileName').value.trim();
  const bucket = document.getElementById('createFileBucket').value;
  const subdir = document.getElementById('createFileSubdir').value;
  const fromId = document.getElementById('createFileFromFile').value;

  if (!filename) { alert('Please enter a file name'); return; }
  if (!bucket)   { alert('Please select a destination bucket'); return; }
  if (!subdir)   { alert('Please select a destination subdirectory'); return; }

  const body = { bucket, subdir, filename };
  if (fromId) Object.assign(body, { fromId });

  try {
    const response = await fetch(`${API_BASE}/buckets/create-file`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'XSRF-Token': getCsrfToken() },
      credentials: 'include',
      body: JSON.stringify(body)
    });
    const data = await response.json();
    if (response.ok) {
      notify(`File created: ${data.name}`);
      document.getElementById('createFileModal').style.display = 'none';
      if (bucket === currentBucket && subdir === currentSubdir) loadSubdir();
    } else {
      notify(data.error || 'Failed to create file');
    }
  } catch (error) {
    notify('Error creating file: ' + error.message);
  }
}

function cancelCreateFile() {
  document.getElementById('createFileModal').style.display = 'none';
}

// #endregion ------------------------------------------------------------------

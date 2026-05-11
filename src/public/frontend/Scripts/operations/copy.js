// #region ===================== COPY ==========================================

/**
 * Opens the copy modal, pre-populated with available buckets and current filename.
 * @returns {Promise<void>}
 */
async function copyFile() {
  if (!currentFiles[currentIndex]) { alert('No file selected'); return; }
  const buckets = await fetch(`${API_BASE}/buckets`).then(r => r.json());
  const bucketSel = document.getElementById('copyToBucket');
  bucketSel.innerHTML = '<option value="">Select bucket...</option>';
  buckets.forEach(b => {
    const opt = document.createElement('option');
    opt.value = b; opt.textContent = b;
    bucketSel.appendChild(opt);
  });
  bucketSel.value = currentBucket || '';
  await onCopyBucketChange();
  document.getElementById('copyFileName').value = currentFiles[currentIndex].name;
  document.getElementById('copyModal').style.display = 'block';
}

async function onCopyBucketChange() {
  const bucket = document.getElementById('copyToBucket').value;
  const subdirSel = document.getElementById('copyToSubdir');
  subdirSel.innerHTML = '<option value="">Select destination...</option>';
  if (!bucket) return;
  const subdirs = await fetch(`${API_BASE}/buckets/${bucket}/subdirs`).then(r => r.json());
  subdirs.forEach(d => {
    const opt = document.createElement('option');
    opt.value = d; opt.textContent = d;
    subdirSel.appendChild(opt);
  });
  if (currentSubdir) subdirSel.value = currentSubdir;
}

/**
 * Executes the file copy to the selected destination.
 * @param {boolean} shouldSave
 * @returns {Promise<void>}
 */
async function confirmCopy(shouldSave) {
  const toBucket = document.getElementById('copyToBucket').value;
  const toSubdir = document.getElementById('copyToSubdir').value;
  const copyName = document.getElementById('copyFileName').value.trim();
  if (!toBucket || !toSubdir) { alert('Please select a destination bucket and subdirectory'); return; }
  if (!copyName) { alert('Please enter a file name'); return; }
  document.getElementById('copyWorking').textContent = 'Working...';
  document.getElementById('copyWorking').style.display = 'block';

  try {
    if (shouldSave) await saveFile(true);

    const response = await fetch(`${API_BASE}/buckets/create-file`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'XSRF-Token': getCsrfToken() },
      credentials: 'include',
      body: JSON.stringify({
        bucket: toBucket,
        subdir: toSubdir,
        filename: copyName,
        fromId: currentFiles[currentIndex]._id
      })
    });
    const data = await response.json();
    document.getElementById('copyModal').style.display = 'none';
    document.getElementById('copyWorking').style.display = 'none';
    if (response.ok) {
      notify(`File successfully copied to\nBucket: ${toBucket}\nSubdirectory: ${toSubdir}`);
      if (toBucket === currentBucket && toSubdir === currentSubdir) loadSubdir();
    } else {
      notify(data.error || 'Failed to copy file');
    }
  } catch (error) {
    document.getElementById('copyModal').style.display = 'none';
    document.getElementById('copyWorking').style.display = 'none';
    notify('Error copying file: ' + error.message);
  }
}

// #endregion ------------------------------------------------------------------

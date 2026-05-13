// #region ===================== MOVE ==========================================

/**
 * Opens the move modal, pre-populated with available buckets and subdirs.
 * @returns {Promise<void>}
 */
async function moveFile() {
  if (!currentFiles[currentIndex]) { alert('No file selected'); return; }
  const buckets = await fetch(`${API_BASE}/buckets`).then(r => r.json());
  const bucketSel = document.getElementById('moveToBucket');
  bucketSel.innerHTML = '<option value="">Select bucket...</option>';
  buckets.forEach(b => {
    const opt = document.createElement('option');
    opt.value = b; opt.textContent = b;
    bucketSel.appendChild(opt);
  });
  bucketSel.value = currentBucket || '';
  await onMoveBucketChange();
  document.getElementById('moveModal').style.display = 'block';
}

async function onMoveBucketChange() {
  const bucket = document.getElementById('moveToBucket').value;
  const subdirSel = document.getElementById('moveToSubdir');
  subdirSel.innerHTML = '<option value="">Select subdirectory...</option>';
  if (!bucket) return;
  const subdirs = await fetch(`${API_BASE}/buckets/${bucket}/subdirs`).then(r => r.json());
  subdirs.forEach(d => {
    const opt = document.createElement('option');
    opt.value = d; opt.textContent = d;
    subdirSel.appendChild(opt);
  });
  if (bucket === currentBucket && currentSubdir) {
    const otherOpt = Array.from(subdirSel.options).find(o => o.value && o.value !== currentSubdir);
    if (otherOpt) subdirSel.value = otherOpt.value;
  } else if (currentSubdir) {
    subdirSel.value = currentSubdir;
  }
}

/**
 * Executes the file move, optionally saving first.
 * @param {boolean} shouldSave
 * @returns {Promise<void>}
 */
async function confirmMove(shouldSave) {
  const toBucket = document.getElementById('moveToBucket').value;
  const toSubdir = document.getElementById('moveToSubdir').value;
  if (!toBucket || !toSubdir) { alert('Please select a destination bucket and subdirectory'); return; }
  if (toBucket === currentBucket && toSubdir === currentSubdir) { alert('Destination is the same as the current location'); return; }
  document.getElementById('moveWorking').textContent = 'Working...';
  document.getElementById('moveWorking').style.display = 'block';

  try {
    if (shouldSave) await saveFile(true);

    const moveResponse = await fetch(`${API_BASE}/buckets/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'XSRF-Token': getCsrfToken() },
      credentials: 'include',
      body: JSON.stringify({
        id: currentFiles[currentIndex]._id,
        fromBucket: currentBucket,
        fromSubdir: currentSubdir,
        toBucket,
        toSubdir
      })
    });

    if (moveResponse.ok) {
      document.getElementById('moveModal').style.display = 'none';
      document.getElementById('moveWorking').style.display = 'none';
      notify(`File successfully moved to\nBucket: ${toBucket}\nSubdirectory: ${toSubdir}`);
      loadSubdir();
    } else if (moveResponse.status === 409) {
      const data = await moveResponse.json();
      document.getElementById('moveModal').style.display = 'none';
      document.getElementById('moveWorking').style.display = 'none';
      notify(data.error || 'A file with this name already exists in the destination');
    } else {
      document.getElementById('moveModal').style.display = 'none';
      document.getElementById('moveWorking').style.display = 'none';
      notify('Failed to move file');
    }
  } catch (error) {
    document.getElementById('moveModal').style.display = 'none';
    document.getElementById('moveWorking').style.display = 'none';
    notify('Error moving file: ' + error.message);
  }
}

// #endregion ------------------------------------------------------------------

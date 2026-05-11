// #region ===================== NAVIGATION ====================================

/**
 * Initializes the app — fetches CSRF token and populates the bucket dropdown.
 * @returns {Promise<void>}
 */
async function init() {
  await fetchCsrfToken();
  document.getElementById('fileCount').textContent = 'File 0 of 0';
  document.getElementById('subdirSelect').innerHTML = '<option value="">Select subdirectory...</option>';
  document.getElementById('fileInfo').innerHTML = '<option value="">Select file...</option>';
  currentBucket = '';
  currentSubdir = '';
  currentFiles = [];
  currentIndex = 0;
  const buckets = await fetch(`${API_BASE}/buckets`).then(r => r.json());
  const bucketSelect = document.getElementById('bucketSelect');
  bucketSelect.innerHTML = '<option value="">Select bucket...</option>';
  buckets.forEach(bucket => {
    const option = document.createElement('option');
    option.value = bucket;
    option.textContent = bucket;
    bucketSelect.appendChild(option);
  });
}

/**
 * Loads subdirectories for the selected bucket and populates the subdir dropdown.
 * @returns {Promise<void>}
 */
async function loadBucket() {
  const bucket = document.getElementById('bucketSelect').value;
  if (!bucket) return;
  if (!(await guardUnsaved())) {
    document.getElementById('bucketSelect').value = currentBucket;
    return;
  }

  currentBucket = bucket;
  document.getElementById('fileCount').textContent = 'File 0 of 0';

  const fileSelect = document.getElementById('fileInfo');
  fileSelect.innerHTML = '<option value="">Select file...</option>';

  const subdirs = await fetch(`${API_BASE}/buckets/${bucket}/subdirs`).then(r => r.json());
  const subdirSelect = document.getElementById('subdirSelect');
  subdirSelect.innerHTML = '<option value="">Select subdirectory...</option>';
  subdirs.forEach(subdir => {
    const opt = document.createElement('option');
    opt.value = subdir;
    opt.textContent = subdir;
    subdirSelect.appendChild(opt);
  });
}

/**
 * Loads files for the selected subdirectory and renders the file list.
 * @returns {Promise<void>}
 */
async function loadSubdir() {
  const subdir = document.getElementById('subdirSelect').value;
  if (!subdir) return;
  if (!(await guardUnsaved())) {
    document.getElementById('subdirSelect').value = currentSubdir;
    return;
  }

  currentSubdir = subdir;
  currentFiles = await fetch(`${API_BASE}/buckets/${currentBucket}/${subdir}/files`).then(r => r.json());
  currentIndex = 0;

  const fileSelect = document.getElementById('fileInfo');
  fileSelect.innerHTML = '<option value="">Select file...</option>';

  currentFiles.forEach((file, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = file.name;
    fileSelect.appendChild(option);
  });

  if (currentFiles.length > 0) {
    fileSelect.selectedIndex = 1;
    loadFile(0, true);
  } else {
    document.getElementById('fileCount').textContent = 'File 0 of 0';
  }
}

/**
 * Loads a specific file by index into the iframe.
 * @param {number} index
 * @param {boolean} [skipGuard=false]
 * @returns {Promise<void>}
 */
async function loadFile(index, skipGuard = false) {
  if (index < 0 || index >= currentFiles.length) return;
  if (!skipGuard && !(await guardUnsaved())) {
    const fileSelect = document.getElementById('fileInfo');
    fileSelect.selectedIndex = currentIndex + 1;
    return;
  }

  currentIndex = index;
  const file = currentFiles[index];

  const content = await fetch(`${API_BASE}/buckets/${currentBucket}/${currentSubdir}/${file._id}`).then(r => r.text());

  const iframe = document.getElementById('formFrame');
  iframe.srcdoc = content;

  iframe.onload = () => {
    const doc = iframe.contentDocument;
    const orgId = doc?.body?.dataset?.orgId;
    const sfIdEl = doc?.getElementById('organization_sfsg_id');
    const sfsg_id = sfIdEl ? sfIdEl.value : 'TBD';
    console.log('[LOAD] File loaded:', file.name, '| Atlas _id:', orgId, '| SFSG sfsg_id:', sfsg_id);
    clearDirty();
    observeIframe(doc);
  };

  const fileSelect = document.getElementById('fileInfo');
  fileSelect.selectedIndex = index + 1;
  document.getElementById('fileCount').textContent = `File ${index + 1} of ${currentFiles.length}`;
}

/**
 * Reads the selected index from the file dropdown and calls loadFile.
 */
function loadSelectedFile() {
  const fileSelect = document.getElementById('fileInfo');
  const selectedIndex = parseInt(fileSelect.value);
  if (!isNaN(selectedIndex)) {
    loadFile(selectedIndex);
  }
}

function loadPrevious() {
  if (currentIndex > 0) loadFile(currentIndex - 1);
}

function loadNext() {
  if (currentIndex < currentFiles.length - 1) loadFile(currentIndex + 1);
}

/**
 * Reloads the current subdir file list without re-loading the iframe.
 * @returns {Promise<void>}
 */
async function reloadSubdirNoLoad() {
  currentFiles = await fetch(`${API_BASE}/buckets/${currentBucket}/${currentSubdir}/files`).then(r => r.json());
  currentIndex = 0;
  const fileSelect = document.getElementById('fileInfo');
  fileSelect.innerHTML = '<option value="">Select file...</option>';
  currentFiles.forEach((file, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = file.name;
    fileSelect.appendChild(option);
  });
  document.getElementById('fileCount').textContent = `File 0 of ${currentFiles.length}`;
  document.getElementById('formFrame').srcdoc = '';
}

// #endregion ------------------------------------------------------------------

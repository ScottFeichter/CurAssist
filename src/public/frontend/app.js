// #region ===================== CONSTANTS / STATE ============================
/** @type {string} Base URL for all local API calls */
const API_BASE = '/api';

/**
 * Shows the reusable notification modal with a message.
 * Dismissed by clicking OK or pressing Enter/Escape.
 * @param {string} message
 */
function notify(message) {
  document.getElementById('notifyMessage').textContent = message;
  document.getElementById('notifyModal').style.display = 'block';
  document.getElementById('notifyOkBtn').focus();
}

function _closeNotify() {
  document.getElementById('notifyModal').style.display = 'none';
}

document.getElementById('notifyOkBtn').addEventListener('click', _closeNotify);

document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' || e.key === 'Escape') {
    // Close notifyModal
    if (document.getElementById('notifyModal').style.display === 'block') {
      _closeNotify();
      return;
    }
    // Close any other visible modal that has a focused or available OK/cancel button
    const visibleModal = Array.from(document.querySelectorAll('.modal')).find(
      m => m.style.display === 'block'
    );
    if (visibleModal) {
      const okBtn = visibleModal.querySelector('.cancel-btn, .submit-btn, #notifyOkBtn');
      if (okBtn) okBtn.click();
    }
  }
});

let currentBucket = '';
let currentSubdir = '';
let currentFiles = [];  // now array of { _id, name } objects
let currentIndex = 0;
let csrfToken = '';

/**
 * Reads the XSRF-TOKEN cookie and returns its decoded value.
 * @returns {string}
 */
function getCsrfToken() {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

/**
 * Fetches a fresh CSRF token from the server and stores it in `csrfToken`.
 * @returns {Promise<void>}
 */
async function fetchCsrfToken() {
  try {
    const response = await fetch(`${API_BASE}/csrf/restore`, {
      credentials: 'include'
    });
    const data = await response.json();
    csrfToken = data['XSRF-Token'];
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
  }
}

/**
 * Initializes the app — fetches CSRF token and populates the bucket dropdown.
 * @returns {Promise<void>}
 */
async function init() {
  await fetchCsrfToken();
  document.getElementById('fileCount').textContent = 'File 0 of 0';
  const buckets = await fetch(`${API_BASE}/buckets`).then(r => r.json());
  const bucketSelect = document.getElementById('bucketSelect');
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
    loadFile(0);
  } else {
    document.getElementById('fileCount').textContent = 'File 0 of 0';
  }
}

/**
 * Loads a specific file by index into the iframe.
 * @param {number} index
 * @returns {Promise<void>}
 */
async function loadFile(index) {
  if (index < 0 || index >= currentFiles.length) return;

  currentIndex = index;
  const file = currentFiles[index];

  const content = await fetch(`${API_BASE}/buckets/${currentBucket}/${currentSubdir}/${file._id}`).then(r => r.text());

  const iframe = document.getElementById('formFrame');
  iframe.srcdoc = content;

  iframe.onload = () => {
    const doc = iframe.contentDocument;
    const orgId = doc?.body?.dataset?.orgId;
    const sfIdEl = doc?.getElementById('organization_sfsg_id');
    const sfsg_id = sfIdEl ? sfIdEl.textContent : 'TBD';
    console.log('[LOAD] File loaded:', file.name, '| Atlas _id:', orgId, '| SFSG sfsg_id:', sfsg_id);
  };

  const fileSelect = document.getElementById('fileInfo');
  fileSelect.selectedIndex = index + 1;
  document.getElementById('fileCount').textContent = `File ${index + 1} of ${currentFiles.length}`;
}

/**
 * Reads the selected index from the file dropdown and calls `loadFile`.
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
 * Syncs live DOM values back into HTML attributes so `outerHTML` captures current state.
 * @param {Document} iframeDoc
 */
function syncIframeValues(iframeDoc) {
  iframeDoc.querySelectorAll('input').forEach(el => {
    if (el.type === 'checkbox' || el.type === 'radio') {
      el.checked ? el.setAttribute('checked', '') : el.removeAttribute('checked');
    } else {
      el.setAttribute('value', el.value);
    }
  });
  iframeDoc.querySelectorAll('textarea').forEach(el => {
    el.textContent = el.value;
  });
  iframeDoc.querySelectorAll('select').forEach(el => {
    Array.from(el.options).forEach(opt => {
      opt.selected ? opt.setAttribute('selected', '') : opt.removeAttribute('selected');
    });
  });
}

/**
 * Saves the current iframe file to the server.
 * @param {boolean} [silent=false] - If true, suppresses the feedback modal (used during submit flow)
 * @returns {Promise<boolean>} True if save succeeded, false otherwise
 */
async function saveFile(silent = false) {
  if (!currentFiles[currentIndex]) return false;

  const iframe = document.getElementById('formFrame');
  const iframeDoc = iframe.contentDocument;

  // Use collector to extract structured field values from the iframe
  let fields = {};
  try {
    const payload = collectFormData();
    fields = payload.organization || payload.service || {};
  } catch (e) {
    fields = {};
  }

  const orgId = iframeDoc?.body?.dataset?.orgId || currentFiles[currentIndex]._id;

  try {
    const res = await fetch(`${API_BASE}/buckets/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'XSRF-Token': getCsrfToken()
      },
      credentials: 'include',
      body: JSON.stringify({ id: orgId, fields })
    });

    if (!res.ok) throw new Error('Server returned ' + res.status);

    if (!silent) {
      document.getElementById('saveFeedbackMessage').textContent = 'File saved successfully.';
      document.getElementById('saveFeedbackModal').style.display = 'block';
    }
    return true;
  } catch (err) {
    if (!silent) {
      document.getElementById('saveFeedbackMessage').textContent = 'Save failed: ' + err.message;
      document.getElementById('saveFeedbackModal').style.display = 'block';
    }
    return false;
  }
}

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
  // pre-select current subdir only if same bucket, exclude it to avoid moving to same place
  if (bucket === currentBucket && currentSubdir) {
    const otherOpt = Array.from(subdirSel.options).find(o => o.value && o.value !== currentSubdir);
    if (otherOpt) subdirSel.value = otherOpt.value;
  } else if (currentSubdir) {
    subdirSel.value = currentSubdir;
  }
}

/**
 * Executes the file move, optionally saving first.
 * @param {boolean} shouldSave - Whether to save the file before moving
 * @returns {Promise<void>}
 */
async function confirmMove(shouldSave) {
  const toBucket = document.getElementById('moveToBucket').value;
  const toSubdir = document.getElementById('moveToSubdir').value;
  if (!toBucket || !toSubdir) { alert('Please select a destination bucket and subdirectory'); return; }
  if (toBucket === currentBucket && toSubdir === currentSubdir) { alert('Destination is the same as the current location'); return; }
  document.getElementById('moveModal').style.display = 'none';

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
      notify(`File moved to ${toBucket} / ${toSubdir}`);
      loadSubdir();
    } else if (moveResponse.status === 409) {
      const data = await moveResponse.json();
      notify(data.error || 'A file with this name already exists in the destination');
    } else {
      notify('Failed to move file');
    }
  } catch (error) {
    notify('Error moving file: ' + error.message);
  }
}

// #endregion ------------------------------------------------------------------

// #region ===================== INIT ==========================================

init();

// #endregion ------------------------------------------------------------------

// #region ===================== FILE OPERATIONS ===============================

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
 * @returns {Promise<void>}
 */
async function confirmCopy(shouldSave) {
  const toBucket = document.getElementById('copyToBucket').value;
  const toSubdir = document.getElementById('copyToSubdir').value;
  const copyName = document.getElementById('copyFileName').value.trim();
  if (!toBucket || !toSubdir) { alert('Please select a destination bucket and subdirectory'); return; }
  if (!copyName) { alert('Please enter a file name'); return; }
  document.getElementById('copyModal').style.display = 'none';

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
    if (response.ok) {
      notify(`File copied to ${toBucket} / ${toSubdir} as ${data.name}`);
      if (toBucket === currentBucket && toSubdir === currentSubdir) loadSubdir();
    } else {
      notify(data.error || 'Failed to copy file');
    }
  } catch (error) {
    notify('Error copying file: ' + error.message);
  }
}

/**
 * Delete file - Step 1: Show first confirmation
 */
function deleteFile() {
  if (!currentFiles[currentIndex]) {
    alert('No file selected');
    return;
  }
  document.getElementById('deleteModal1').style.display = 'block';
}

/**
 * Delete file - Step 2: Show second confirmation with text input
 */
function confirmDelete() {
  document.getElementById('deleteModal1').style.display = 'none';
  document.getElementById('deleteModal2').style.display = 'block';
  document.getElementById('deleteConfirmInput').value = '';
}

/**
 * Delete file - Step 3: Validate and execute delete
 * @returns {Promise<void>}
 */
async function finalDelete() {
  const input = document.getElementById('deleteConfirmInput').value;

  if (input !== 'delete') {
    alert('You must type "delete" exactly to confirm');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/buckets/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'XSRF-Token': getCsrfToken()
      },
      credentials: 'include',
      body: JSON.stringify({ id: currentFiles[currentIndex]._id })
    });

    if (response.ok) {
      notify('File deleted successfully');
      document.getElementById('deleteModal2').style.display = 'none';
      loadSubdir();
    } else {
      notify('Failed to delete file');
    }
  } catch (error) {
    notify('Error deleting file: ' + error.message);
  }
}

/**
 * Cancels delete and closes all delete modals.
 */
function cancelDelete() {
  document.getElementById('deleteModal1').style.display = 'none';
  document.getElementById('deleteModal2').style.display = 'none';
  document.getElementById('deleteConfirmInput').value = '';
}

/**
 * Submit file - Show confirmation modal, or warn if org already has a sfsg_id.
 */
function submitFile() {
  if (!currentFiles[currentIndex]) { alert('No file selected'); return; }
  if (currentSubdir === 'Complete') {
    document.getElementById('alreadyCompleteModal').style.display = 'block';
    return;
  }
  const iframe = document.getElementById('formFrame');
  const sfsgIdEl = iframe.contentDocument?.getElementById('organization_sfsg_id');
  const sfsgId = sfsgIdEl ? sfsgIdEl.textContent.trim() : 'TBD';
  if (sfsgId && sfsgId !== 'TBD') {
    document.getElementById('submitWarnSfsgId').textContent = sfsgId;
    document.getElementById('submitWarnModal').style.display = 'block';
    return;
  }
  document.getElementById('submitModal').style.display = 'block';
}

/**
 * Confirms submit — closes modal and triggers `submitFormData` as a new org.
 */
function confirmSubmit() {
  console.log('[SUBMIT] confirmSubmit called');
  document.getElementById('submitModal').style.display = 'none';
  submitFormData('new');
}

/**
 * Cancels submit and closes the submit modal.
 */
function cancelSubmit() {
  document.getElementById('submitModal').style.display = 'none';
}

/** Update Existing path — triggers change_requests flow. */
function confirmSubmitUpdate() {
  document.getElementById('submitWarnModal').style.display = 'none';
  submitFormData('update');
}

/** Create New path — ignores existing sfsg_id and creates a fresh org. */
function confirmSubmitNew() {
  document.getElementById('submitWarnModal').style.display = 'none';
  submitFormData('new');
}

function cancelSubmitWarn() {
  document.getElementById('submitWarnModal').style.display = 'none';
}

/**
 * Closes the submit result modal and reloads the subdir file list.
 */
function onSubmitResultOk() {
  document.getElementById('submitResultModal').style.display = 'none';
  reloadSubdirNoLoad();
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

/**
 * Opens the create bucket modal and resets its state.
 */
function createBucket() {
  selectedFile = null;
  document.getElementById('createBucketName').value = '';
  document.getElementById('createBucketEmpty').checked = false;
  document.getElementById('createBucketDirectSubmit').checked = false;
  document.getElementById('createBucketSpreadsheetSection').style.display = 'block';
  document.getElementById('uploadText').textContent = 'Click to select file or drag and drop';
  document.getElementById('createBucketBtn').disabled = true;
  document.getElementById('progressContainer').style.display = 'none';
  document.getElementById('progressBar').style.width = '0%';
  document.getElementById('progressBar').textContent = '0%';
  document.getElementById('createBucketModal').style.display = 'block';
}

function toggleCreateBucketEmpty() {
  const isEmpty = document.getElementById('createBucketEmpty').checked;
  document.getElementById('createBucketSpreadsheetSection').style.display = isEmpty ? 'none' : 'block';
  document.getElementById('createBucketBtn').disabled = !isEmpty && !selectedFile;
}

/**
 * Handles file input selection for bucket upload.
 * @param {Event} event
 */
function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    selectedFile = file;
    document.getElementById('uploadText').textContent = `Selected: ${file.name}`;
    const isEmpty = document.getElementById('createBucketEmpty').checked;
    if (!isEmpty) document.getElementById('createBucketBtn').disabled = false;
  }
}

// Drag and drop handlers
const uploadArea = document.getElementById('fileUploadArea');
if (uploadArea) {
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv') || file.name.endsWith('.ods'))) {
      selectedFile = file;
      document.getElementById('uploadText').textContent = `Selected: ${file.name}`;
      document.getElementById('createBucketBtn').disabled = false;
    } else {
      alert('Please upload a valid spreadsheet file (.xlsx, .xls, .csv, or .ods)');
    }
  });
}

/**
 * Uploads the selected spreadsheet and creates a new bucket.
 * @returns {Promise<void>}
 */
async function processCreateBucket() {
  const bucketName     = document.getElementById('createBucketName').value.trim();
  const isEmpty        = document.getElementById('createBucketEmpty').checked;
  const directSubmit   = document.getElementById('createBucketDirectSubmit').checked;

  if (!bucketName) { alert('Please enter a bucket name'); return; }

  if (isEmpty) {
    try {
      const response = await fetch(`${API_BASE}/buckets/create-bucket-empty`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'XSRF-Token': getCsrfToken() },
        credentials: 'include',
        body: JSON.stringify({ bucketName })
      });
      const data = await response.json();
      if (response.ok) {
        notify(`Bucket "${bucketName}" created successfully`);
        document.getElementById('createBucketModal').style.display = 'none';
        init();
      } else {
        notify(data.error || 'Failed to create bucket');
      }
    } catch (error) {
      notify('Error creating bucket: ' + error.message);
    }
    return;
  }

  if (!selectedFile) return;

  const formData = new FormData();
  formData.append('spreadsheet', selectedFile);
  formData.append('bucketName', bucketName);

  document.getElementById('createBucketBtn').disabled = true;
  document.getElementById('progressContainer').style.display = 'block';

  const endpoint = directSubmit
    ? `${API_BASE}/buckets/create-bucket-spreadsheet-submit`
    : `${API_BASE}/buckets/create-bucket-spreadsheet`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'XSRF-Token': getCsrfToken() },
      credentials: 'include',
      body: formData
    });
    const data = await response.json();

    document.getElementById('progressBar').style.width = '100%';
    document.getElementById('progressBar').textContent = '100%';
    document.getElementById('createBucketModal').style.display = 'none';

    if (directSubmit && response.ok) {
      const orgs = data.orgs || [];
      const bucketName = data.bucketName;
      document.getElementById('createBucketModal').style.display = 'none';

      // Browser-side submit loop using the existing SF proxy
      let succeeded = 0;
      const failed = [];

      for (let i = 0; i < orgs.length; i++) {
        const org = orgs[i];
        document.getElementById('progressBar').style.width = `${Math.round(((i + 1) / orgs.length) * 100)}%`;
        document.getElementById('progressBar').textContent = `Submitting ${i + 1} of ${orgs.length}: ${org.name}...`;

        try {
          // Load the org's hydrated data from Atlas
          const hydrateRes = await fetch(`${API_BASE}/buckets/${bucketName}/incomplete/${org._id}`);
          if (!hydrateRes.ok) throw new Error(`Failed to load org: ${hydrateRes.status}`);

          // Parse the hydrated HTML to collect form data
          const html = await hydrateRes.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');

          // Collect org data from the parsed document
          const payload = { organization: collectOrganization(doc) };
          const locs = doc.querySelectorAll('#organization_locations .location-row');
          console.log('[BATCH SUBMIT] location rows found:', locs.length, locs.length > 0 ? 'first row dataset:' + JSON.stringify(locs[0].dataset) : '');
          console.log('[BATCH SUBMIT] collected payload for', org.name, ':', JSON.stringify(payload).substring(0, 300));
          const { orgBody, services } = transformNewOrg(payload);
          console.log('[BATCH SUBMIT] orgBody:', JSON.stringify(orgBody).substring(0, 300));

          // Step 1 — create org via SF proxy
          const orgRes = await fetch(`${API_BASE}/sf/resources`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'XSRF-Token': getCsrfToken() },
            credentials: 'include',
            body: JSON.stringify(orgBody)
          });
          if (!orgRes.ok) {
            const err = await orgRes.json().catch(() => ({}));
            throw new Error(`SFSG ${orgRes.status}: ${JSON.stringify(err)}`);
          }
          const orgData = await orgRes.json();
          const sfsg_id = orgData.resources?.[0]?.resource?.id;
          if (!sfsg_id) throw new Error('No org ID returned from SFSG');

          // Step 2 — create services if any
          if (services.length > 0) {
            services.forEach((svc, idx) => svc.id = -(idx + 2));
            const svcRes = await fetch(`${API_BASE}/sf/resources/${sfsg_id}/services`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'XSRF-Token': getCsrfToken() },
              credentials: 'include',
              body: JSON.stringify({ services })
            });
            if (!svcRes.ok) {
              const err = await svcRes.json().catch(() => ({}));
              throw new Error(`Services failed ${svcRes.status}: ${JSON.stringify(err)}`);
            }
          }

          // Step 3 — write sfsg_id back to Atlas
          await fetch(`${API_BASE}/buckets/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'XSRF-Token': getCsrfToken() },
            credentials: 'include',
            body: JSON.stringify({ id: org._id, sfsg_id })
          });

          succeeded++;
        } catch (err) {
          failed.push({ name: org.name, error: err.message });
        }
      }

      document.getElementById('progressBar').style.width = '100%';
      document.getElementById('progressBar').textContent = '100%';

      let msg = `Submitted ${succeeded} of ${orgs.length} orgs to SF Service Guide.`;
      if (failed.length) {
        msg += `\n\nFailed (${failed.length}):` + failed.map(f => `\n  • ${f.name}: ${f.error}`).join('');
      }
      document.getElementById('directSubmitResultMessage').textContent = msg;
      document.getElementById('directSubmitResultModal').style.display = 'block';
      init();
    } else if (response.ok) {
      notify(data.message || 'Bucket created successfully');
      init();
    } else {
      notify(data.error || 'Failed to create bucket');
    }
  } catch (error) {
    notify('Error creating bucket: ' + error.message);
  } finally {
    document.getElementById('createBucketBtn').disabled = false;
  }
}

/**
 * Cancels bucket creation and closes the modal.
 */
function cancelCreateBucket() {
  document.getElementById('createBucketModal').style.display = 'none';
  document.getElementById('createBucketName').value = '';
  document.getElementById('createBucketEmpty').checked = false;
  document.getElementById('createBucketDirectSubmit').checked = false;
  document.getElementById('createBucketSpreadsheetSection').style.display = 'block';
  selectedFile = null;
}

/**
 * Delete bucket - Step 1: Show bucket selection modal
 * @returns {Promise<void>}
 */
async function deleteBucket() {
  const buckets = await fetch(`${API_BASE}/buckets`).then(r => r.json());
  const select = document.getElementById('deleteBucketSelect');
  select.innerHTML = '<option value="">Select bucket...</option>';
  
  buckets.forEach(bucket => {
    const option = document.createElement('option');
    option.value = bucket;
    option.textContent = bucket;
    select.appendChild(option);
  });
  
  document.getElementById('deleteBucketModal1').style.display = 'block';
}

/**
 * Delete bucket - Step 2: Show confirmation with text input
 */
function confirmDeleteBucket() {
  const bucketName = document.getElementById('deleteBucketSelect').value;
  
  if (!bucketName) {
    alert('Please select a bucket');
    return;
  }
  
  document.getElementById('deleteBucketModal1').style.display = 'none';
  document.getElementById('deleteBucketWarning').textContent = 
    `This will permanently delete ${bucketName} and all its subdirectories and files contained within. If you are sure you want to proceed type "delete" and press the delete button`;
  document.getElementById('deleteBucketConfirmInput').value = '';
  document.getElementById('deleteBucketModal2').style.display = 'block';
}

/**
 * Delete bucket - Step 3: Validate and execute delete
 * @returns {Promise<void>}
 */
async function finalDeleteBucket() {
  const input = document.getElementById('deleteBucketConfirmInput').value;
  
  if (input !== 'delete') {
    alert('You must type "delete" exactly to confirm');
    return;
  }
  
  const bucketName = document.getElementById('deleteBucketSelect').value;
  
  try {
    const response = await fetch(`${API_BASE}/buckets/${bucketName}`, {
      method: 'DELETE',
      headers: { 
        'XSRF-Token': getCsrfToken()
      },
      credentials: 'include'
    });
    
    if (response.ok) {
      notify('Bucket deleted successfully');
      document.getElementById('deleteBucketModal2').style.display = 'none';
      init();
    } else {
      notify('Failed to delete bucket');
    }
  } catch (error) {
    notify('Error deleting bucket: ' + error.message);
  }
}

/**
 * Cancel delete bucket - close all modals
 */
function cancelDeleteBucket() {
  document.getElementById('deleteBucketModal1').style.display = 'none';
  document.getElementById('deleteBucketModal2').style.display = 'none';
  document.getElementById('deleteBucketConfirmInput').value = '';
}

/**
 * Opens the create file modal, pre-populated with available buckets.
 * @returns {Promise<void>}
 */
async function createFile() {
  // Populate destination bucket dropdown
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

  // Pre-select current bucket if one is active
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

/**
 * Executes file creation at the selected destination, optionally copying from a source file.
 * @returns {Promise<void>}
 */
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

/**
 * Cancels file creation and closes the modal.
 */
function cancelCreateFile() {
  document.getElementById('createFileModal').style.display = 'none';
}

/**
 * Opens the Import Bucket modal.
 */
function importMultipleFiles() {
  document.getElementById('importBucketName').value = '';
  document.getElementById('importBucketRangeStart').value = '';
  document.getElementById('importBucketRangeEnd').value = '';
  document.getElementById('importBucketSeries').value = '';
  document.getElementById('importBucketUseRange').checked = false;
  document.getElementById('importBucketUseSeries').checked = false;
  document.getElementById('importBucketError').textContent = '';
  document.getElementById('importBucketProgress').style.display = 'none';
  document.getElementById('importBucketModal').style.display = 'block';
}

/**
 * Collects org IDs from range and/or series, creates a bucket, and imports each org.
 */
async function confirmImportBucket() {
  const bucketName  = document.getElementById('importBucketName').value.trim();
  const useRange    = document.getElementById('importBucketUseRange').checked;
  const useSeries   = document.getElementById('importBucketUseSeries').checked;
  const rangeStart  = parseInt(document.getElementById('importBucketRangeStart').value);
  const rangeEnd    = parseInt(document.getElementById('importBucketRangeEnd').value);
  const seriesRaw   = document.getElementById('importBucketSeries').value;
  const errEl       = document.getElementById('importBucketError');
  const progressEl  = document.getElementById('importBucketProgress');

  errEl.textContent = '';

  if (!bucketName)              { errEl.textContent = 'Bucket name is required.'; return; }
  if (!useRange && !useSeries)  { errEl.textContent = 'Select at least one of Range or Series.'; return; }
  if (useRange && (isNaN(rangeStart) || isNaN(rangeEnd))) { errEl.textContent = 'Range requires a valid start and end ID.'; return; }
  if (useRange && rangeStart > rangeEnd) { errEl.textContent = 'Range start must be less than or equal to end.'; return; }

  // Build deduplicated list of org IDs
  const ids = new Set();
  if (useRange) {
    for (let i = rangeStart; i <= rangeEnd; i++) ids.add(i);
  }
  if (useSeries) {
    seriesRaw.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)).forEach(n => ids.add(n));
  }

  if (ids.size === 0) { errEl.textContent = 'No valid org IDs found.'; return; }

  // Create the bucket first
  try {
    const bucketRes = await fetch(`${API_BASE}/buckets/create-bucket-empty`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'XSRF-Token': getCsrfToken() },
      credentials: 'include',
      body: JSON.stringify({ bucketName })
    });
    if (!bucketRes.ok) {
      const data = await bucketRes.json();
      errEl.textContent = data.error || 'Failed to create bucket.';
      return;
    }
  } catch (err) {
    errEl.textContent = 'Failed to create bucket: ' + err.message;
    return;
  }

  // Import each org ID
  progressEl.style.display = 'block';
  const idList = Array.from(ids);
  let succeeded = 0;
  let failed = [];

  for (let i = 0; i < idList.length; i++) {
    const orgId = idList[i];
    progressEl.textContent = `Importing ${i + 1} of ${idList.length} (ID: ${orgId})...`;
    try {
      const res = await fetch(`${API_BASE}/buckets/import-file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'XSRF-Token': getCsrfToken() },
        credentials: 'include',
        body: JSON.stringify({ orgId, bucket: bucketName, subdir: 'incomplete' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        succeeded++;
      } else {
        failed.push(orgId);
      }
    } catch (err) {
      failed.push(orgId);
    }
  }

  document.getElementById('importBucketModal').style.display = 'none';

  const msg = `Imported ${succeeded} of ${idList.length} orgs into "${bucketName}".`
    + (failed.length ? `\n\nFailed IDs: ${failed.join(', ')}` : '');
  document.getElementById('importBucketResultMessage').textContent = msg;
  document.getElementById('importBucketResultModal').style.display = 'block';
}

/**
 * Opens the Import File modal, populating the bucket dropdown.
 */
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

/**
 * Populates the subdirectory dropdown when a bucket is selected in the import modal.
 */
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

/**
 * Submits the import-file request to the server.
 */
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

  const res = await fetch('/api/buckets/import-file', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'XSRF-Token': getCsrfToken() },
    body: JSON.stringify({ orgId, bucket, subdir })
  });

  document.getElementById('importFileModal').style.display = 'none';
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
    // Duplicate found — show resolution modal
    document.getElementById('importDuplicateMessage').textContent =
      `An org named "${data.existingName}" already exists in this bucket. What would you like to do?`;
    document.getElementById('importDuplicateOverwrite').checked = false;
    document.getElementById('importDuplicateRename').checked = false;
    document.getElementById('importDuplicateNewName').style.display = 'none';
    document.getElementById('importDuplicateNewName').value = '';
    document.getElementById('importDuplicateError').textContent = '';
    // Store context for the resolve call
    window._importDuplicateContext = { bucket, subdir, existingId: data.existingId, resource: data.resource };
    document.getElementById('importDuplicateModal').style.display = 'block';
    return;
  }

  if (!res.ok || !data.success) {
    msgEl.innerHTML = `Import failed.<br>${data.error || 'Unknown error.'}`;
  } else {
    msgEl.innerHTML = `Import successful!<br>${data.name}`;
    if (currentBucket === bucket && currentSubdir === subdir) {
      await loadSubdir();
    }
  }

  document.getElementById('importResultModal').style.display = 'block';
}

function cancelImportFile() {
  document.getElementById('importFileModal').style.display = 'none';
}

/**
 * Toggles the rename input field visibility based on selected duplicate action.
 */
document.addEventListener('change', function(e) {
  if (e.target.name === 'importDuplicateAction') {
    const nameInput = document.getElementById('importDuplicateNewName');
    nameInput.style.display = e.target.value === 'rename' ? 'block' : 'none';
  }
});

/**
 * Submits the duplicate resolution — overwrite or rename.
 */
async function confirmImportDuplicate() {
  const action   = document.querySelector('input[name="importDuplicateAction"]:checked')?.value;
  const newName  = document.getElementById('importDuplicateNewName').value.trim();
  const errEl    = document.getElementById('importDuplicateError');
  const ctx      = window._importDuplicateContext;
  errEl.textContent = '';

  if (!action)                          { errEl.textContent = 'Please select an option.'; return; }
  if (action === 'rename' && !newName)  { errEl.textContent = 'Please enter a new name.'; return; }

  document.getElementById('importDuplicateModal').style.display = 'none';

  const res = await fetch(`${API_BASE}/buckets/import-file-resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'XSRF-Token': getCsrfToken() },
    credentials: 'include',
    body: JSON.stringify({ bucket: ctx.bucket, subdir: ctx.subdir, existingId: ctx.existingId, action, newName, resource: ctx.resource })
  });

  const msgEl = document.getElementById('importResultMessage');
  let data;
  try { data = await res.json(); } catch (e) {
    msgEl.innerHTML = `Import failed.<br>Server error (${res.status}).`;
    document.getElementById('importResultModal').style.display = 'block';
    return;
  }

  if (!res.ok || !data.success) {
    msgEl.innerHTML = `Import failed.<br>${data.error || 'Unknown error.'}`;
  } else {
    console.log('Import resolve result:', data);
    msgEl.innerHTML = `Import successful!<br>${data.name}`;
    if (currentBucket === ctx.bucket && currentSubdir === ctx.subdir) await loadSubdir();
  }
  document.getElementById('importResultModal').style.display = 'block';
}

// #endregion ------------------------------------------------------------------

// #region ===================== UI / SIDEBAR ==================================

/**
 * Toggles the left sidebar collapsed/expanded state.
 */
function toggleSidebar() {
  const el = document.getElementById('leftSidebar');
  const btn = document.querySelector('.leftSidebar-toggle-btn');
  el.classList.toggle('collapsed');
  btn.classList.toggle('sidebar-closed', el.classList.contains('collapsed'));
  if (el.classList.contains('collapsed')) {
    if (parseInt(el.style.width) > 0) el.dataset.prevWidth = el.style.width;
    el.style.width = '';
    el.style.padding = '';
  } else {
    el.style.width = el.dataset.prevWidth || '250px';
    el.style.padding = '';
  }
}

/**
 * Toggles the right sidebar collapsed/expanded state.
 */
function toggleRightSidebar() {
  const el = document.getElementById('rightSidebar');
  const btn = document.querySelector('.rightSidebar-toggle-btn');
  el.classList.toggle('collapsed');
  btn.classList.toggle('sidebar-closed', el.classList.contains('collapsed'));
  if (el.classList.contains('collapsed')) {
    if (parseInt(el.style.width) > 0) el.dataset.prevWidth = el.style.width;
    el.style.width = '';
    el.style.padding = '';
  } else {
    el.style.width = el.dataset.prevWidth || '250px';
    el.style.padding = '';
  }
}

// Sidebar resize functionality
let isResizingLeft = false;
let isResizingRight = false;
let startX = 0;
let startWidth = 0;

const resizeHandle = document.getElementById('resizeHandle');
const rightResizeHandle = document.getElementById('rightResizeHandle');
const sidebar = document.getElementById('leftSidebar');
const rightSidebar = document.getElementById('rightSidebar');

resizeHandle.addEventListener('mousedown', (e) => {
  isResizingLeft = true;
  startX = e.clientX;
  startWidth = sidebar.offsetWidth;
  sidebar.dataset.prevWidth = startWidth + 'px';
  sidebar.style.transition = 'none';
  document.body.style.cursor = 'ew-resize';
  document.body.style.userSelect = 'none';
  document.getElementById('formFrame').style.pointerEvents = 'none';
  e.preventDefault();
});

rightResizeHandle.addEventListener('mousedown', (e) => {
  isResizingRight = true;
  startX = e.clientX;
  startWidth = rightSidebar.offsetWidth;
  rightSidebar.dataset.prevWidth = startWidth + 'px';
  rightSidebar.style.transition = 'none';
  document.body.style.cursor = 'ew-resize';
  document.body.style.userSelect = 'none';
  document.getElementById('formFrame').style.pointerEvents = 'none';
  e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
  if (isResizingLeft) {
    e.preventDefault();
    const width = Math.max(0, startWidth + (e.clientX - startX));
    if (width <= 600) {
      sidebar.style.width = width + 'px';
      sidebar.style.padding = width === 0 ? '0' : '';
    }
  }
  if (isResizingRight) {
    e.preventDefault();
    const width = Math.max(0, startWidth + (startX - e.clientX));
    if (width <= 600) {
      rightSidebar.style.width = width + 'px';
      rightSidebar.style.padding = width === 0 ? '0' : '';
    }
  }
});

/**
 * Stops any active sidebar resize and restores pointer/cursor state.
 */
function stopResize() {
  if (isResizingLeft) sidebar.style.transition = '';
  if (isResizingRight) rightSidebar.style.transition = '';
  isResizingLeft = false;
  isResizingRight = false;
  document.body.style.cursor = '';
  document.body.style.userSelect = '';
  document.getElementById('formFrame').style.pointerEvents = '';
}

document.addEventListener('mouseup', stopResize);

// #endregion ------------------------------------------------------------------

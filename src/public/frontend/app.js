// #region ===================== CONSTANTS =====================================
const API_BASE = '/api';

let currentBucket = '';
let currentSubdir = '';
let currentFiles = [];
let currentIndex = 0;
let csrfToken = '';

// Get CSRF token from cookie
function getCsrfToken() {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

// Fetch CSRF token from server
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

// Initialize
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

// Load bucket subdirectories
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

// Load subdirectory files
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
    option.textContent = file;
    fileSelect.appendChild(option);
  });

  // Update file list only
  if (currentFiles.length > 0) {
    fileSelect.selectedIndex = 1;
    loadFile(0);
  } else {
    document.getElementById('fileCount').textContent = 'File 0 of 0';
  }
}

// Load specific file
async function loadFile(index) {
  if (index < 0 || index >= currentFiles.length) return;

  currentIndex = index;
  const filename = currentFiles[index];

  const content = await fetch(`${API_BASE}/buckets/${currentBucket}/${currentSubdir}/${filename}`).then(r => r.text());

  const iframe = document.getElementById('formFrame');
  iframe.srcdoc = content;

  const fileSelect = document.getElementById('fileInfo');
  fileSelect.selectedIndex = index + 1;
  document.getElementById('fileCount').textContent = `File ${index + 1} of ${currentFiles.length}`;
}

// Load file from dropdown selection
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

// Save file
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

async function saveFile() {
  if (!currentFiles[currentIndex]) return;

  const iframe = document.getElementById('formFrame');
  syncIframeValues(iframe.contentDocument);
  const content = iframe.contentDocument.documentElement.outerHTML;

  await fetch(`${API_BASE}/buckets/save`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'XSRF-Token': getCsrfToken()
    },
    credentials: 'include',
    body: JSON.stringify({
      bucket: currentBucket,
      subdir: currentSubdir,
      filename: currentFiles[currentIndex],
      content: '<!DOCTYPE html>\n' + content
    })
  });

  alert('File saved successfully');
}

// Move file
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

async function confirmMove(shouldSave) {
  const toBucket = document.getElementById('moveToBucket').value;
  const toSubdir = document.getElementById('moveToSubdir').value;
  if (!toBucket || !toSubdir) { alert('Please select a destination bucket and subdirectory'); return; }
  if (toBucket === currentBucket && toSubdir === currentSubdir) { alert('Destination is the same as the current location'); return; }
  document.getElementById('moveModal').style.display = 'none';

  try {
    if (shouldSave) {
      const iframe = document.getElementById('formFrame');
      const content = iframe.contentDocument.documentElement.outerHTML;
      await fetch(`${API_BASE}/buckets/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'XSRF-Token': getCsrfToken() },
        credentials: 'include',
        body: JSON.stringify({ bucket: currentBucket, subdir: currentSubdir, filename: currentFiles[currentIndex], content: '<!DOCTYPE html>\n' + content })
      });
    }

    const moveResponse = await fetch(`${API_BASE}/buckets/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'XSRF-Token': getCsrfToken() },
      credentials: 'include',
      body: JSON.stringify({ fromBucket: currentBucket, fromSubdir: currentSubdir, toBucket, toSubdir, filename: currentFiles[currentIndex] })
    });

    if (moveResponse.ok) {
      alert(`File moved to ${toBucket} / ${toSubdir}`);
      loadSubdir();
    } else if (moveResponse.status === 409) {
      const data = await moveResponse.json();
      alert(data.error || 'A file with this name already exists in the destination');
    } else {
      alert('Failed to move file');
    }
  } catch (error) {
    alert('Error moving file: ' + error.message);
  }
}

// Initialize on load
init();

// Copy file
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
  document.getElementById('copyFileName').value = currentFiles[currentIndex].replace(/\.html$/i, '');
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

async function confirmCopy() {
  const toBucket = document.getElementById('copyToBucket').value;
  const toSubdir = document.getElementById('copyToSubdir').value;
  const copyName = document.getElementById('copyFileName').value.trim();
  if (!toBucket || !toSubdir) { alert('Please select a destination bucket and subdirectory'); return; }
  if (!copyName) { alert('Please enter a file name'); return; }
  document.getElementById('copyModal').style.display = 'none';

  try {
    const response = await fetch(`${API_BASE}/buckets/create-file`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'XSRF-Token': getCsrfToken() },
      credentials: 'include',
      body: JSON.stringify({
        bucket: toBucket,
        subdir: toSubdir,
        filename: copyName + '.html',
        fromBucket: currentBucket,
        fromSubdir: currentSubdir,
        fromFilename: currentFiles[currentIndex]
      })
    });
    const data = await response.json();
    if (response.ok) {
      alert(`File copied to ${toBucket} / ${toSubdir} as ${data.filename}`);
      if (toBucket === currentBucket && toSubdir === currentSubdir) loadSubdir();
    } else {
      alert(data.error || 'Failed to copy file');
    }
  } catch (error) {
    alert('Error copying file: ' + error.message);
  }
}

// Delete file - Step 1: Show first confirmation
function deleteFile() {
  if (!currentFiles[currentIndex]) {
    alert('No file selected');
    return;
  }
  document.getElementById('deleteModal1').style.display = 'block';
}

// Delete file - Step 2: Show second confirmation with text input
function confirmDelete() {
  document.getElementById('deleteModal1').style.display = 'none';
  document.getElementById('deleteModal2').style.display = 'block';
  document.getElementById('deleteConfirmInput').value = '';
}

// Delete file - Step 3: Validate and execute delete
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
      body: JSON.stringify({
        bucket: currentBucket,
        subdir: currentSubdir,
        filename: currentFiles[currentIndex]
      })
    });

    if (response.ok) {
      alert('File deleted successfully');
      document.getElementById('deleteModal2').style.display = 'none';
      loadSubdir();
    } else {
      alert('Failed to delete file');
    }
  } catch (error) {
    alert('Error deleting file: ' + error.message);
  }
}

// Cancel delete - close all modals
function cancelDelete() {
  document.getElementById('deleteModal1').style.display = 'none';
  document.getElementById('deleteModal2').style.display = 'none';
  document.getElementById('deleteConfirmInput').value = '';
}

// Submit file - Show confirmation modal
function submitFile() {
  if (!currentFiles[currentIndex]) { alert('No file selected'); return; }
  if (currentSubdir === 'Complete') {
    document.getElementById('alreadyCompleteModal').style.display = 'block';
    return;
  }
  document.getElementById('submitModal').style.display = 'block';
}

// Confirm submit
function confirmSubmit() {
  document.getElementById('submitModal').style.display = 'none';
  submitFormData();
}

// Cancel submit - close modal
function cancelSubmit() {
  document.getElementById('submitModal').style.display = 'none';
}

function onSubmitSuccessOk() {
  document.getElementById('submitSuccessModal').style.display = 'none';
  reloadSubdirNoLoad();
}

async function reloadSubdirNoLoad() {
  currentFiles = await fetch(`${API_BASE}/buckets/${currentBucket}/${currentSubdir}/files`).then(r => r.json());
  currentIndex = 0;
  const fileSelect = document.getElementById('fileInfo');
  fileSelect.innerHTML = '<option value="">Select file...</option>';
  currentFiles.forEach((file, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = file;
    fileSelect.appendChild(option);
  });
  document.getElementById('fileCount').textContent = `File 0 of ${currentFiles.length}`;
  document.getElementById('formFrame').srcdoc = '';
}

// Create bucket - placeholder
let selectedFile = null;

function createBucket() {
  selectedFile = null;
  document.getElementById('uploadText').textContent = 'Click to select file or drag and drop';
  document.getElementById('createBucketBtn').disabled = true;
  document.getElementById('progressContainer').style.display = 'none';
  document.getElementById('progressBar').style.width = '0%';
  document.getElementById('progressBar').textContent = '0%';
  document.getElementById('createBucketModal').style.display = 'block';
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    selectedFile = file;
    document.getElementById('uploadText').textContent = `Selected: ${file.name}`;
    document.getElementById('createBucketBtn').disabled = false;
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

async function processCreateBucket() {
  if (!selectedFile) return;

  const bucketName = prompt('Enter bucket name:');
  if (!bucketName) return;

  const formData = new FormData();
  formData.append('spreadsheet', selectedFile);
  formData.append('bucketName', bucketName);

  document.getElementById('createBucketBtn').disabled = true;
  document.getElementById('progressContainer').style.display = 'block';

  try {
    const response = await fetch(`${API_BASE}/buckets/create`, {
      method: 'POST',
      headers: {
        'XSRF-Token': getCsrfToken()
      },
      credentials: 'include',
      body: formData
    });

    if (response.ok) {
      const data = await response.json();
      document.getElementById('progressBar').style.width = '100%';
      document.getElementById('progressBar').textContent = '100%';
      alert(data.message || 'Bucket created successfully');
      document.getElementById('createBucketModal').style.display = 'none';
      init();
    } else {
      const error = await response.json();
      alert(error.error || 'Failed to create bucket');
    }
  } catch (error) {
    alert('Error creating bucket: ' + error.message);
  } finally {
    document.getElementById('createBucketBtn').disabled = false;
  }
}

function cancelCreateBucket() {
  document.getElementById('createBucketModal').style.display = 'none';
  selectedFile = null;
}

// Delete bucket - Step 1: Show bucket selection modal
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

// Delete bucket - Step 2: Show confirmation with text input
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

// Delete bucket - Step 3: Validate and execute delete
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
      alert('Bucket deleted successfully');
      document.getElementById('deleteBucketModal2').style.display = 'none';
      init();
    } else {
      alert('Failed to delete bucket');
    }
  } catch (error) {
    alert('Error deleting bucket: ' + error.message);
  }
}

// Cancel delete bucket - close all modals
function cancelDeleteBucket() {
  document.getElementById('deleteBucketModal1').style.display = 'none';
  document.getElementById('deleteBucketModal2').style.display = 'none';
  document.getElementById('deleteBucketConfirmInput').value = '';
}

// Create file
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
    opt.value = f; opt.textContent = f;
    fileSel.appendChild(opt);
  });
}

async function confirmCreateFile() {
  const filename = document.getElementById('createFileName').value.trim();
  const bucket = document.getElementById('createFileBucket').value;
  const subdir = document.getElementById('createFileSubdir').value;
  const fromBucket = document.getElementById('createFileFromBucket').value;
  const fromSubdir = document.getElementById('createFileFromSubdir').value;
  const fromFilename = document.getElementById('createFileFromFile').value;

  if (!filename) { alert('Please enter a file name'); return; }
  if (!bucket) { alert('Please select a destination bucket'); return; }
  if (!subdir) { alert('Please select a destination subdirectory'); return; }

  const body = { bucket, subdir, filename };
  if (fromBucket && fromSubdir && fromFilename) {
    Object.assign(body, { fromBucket, fromSubdir, fromFilename });
  }

  try {
    const response = await fetch(`${API_BASE}/buckets/create-file`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'XSRF-Token': getCsrfToken() },
      credentials: 'include',
      body: JSON.stringify(body)
    });
    const data = await response.json();
    if (response.ok) {
      alert(`File created: ${data.filename}`);
      document.getElementById('createFileModal').style.display = 'none';
      // Reload file list if we're in the same bucket/subdir
      if (bucket === currentBucket && subdir === currentSubdir) loadSubdir();
    } else {
      alert(data.error || 'Failed to create file');
    }
  } catch (error) {
    alert('Error creating file: ' + error.message);
  }
}

function cancelCreateFile() {
  document.getElementById('createFileModal').style.display = 'none';
}

// #endregion ------------------------------------------------------------------

// Toggle sidebars
function toggleSidebar() {
  const el = document.getElementById('leftSidebar');
  el.classList.toggle('collapsed');
  if (el.classList.contains('collapsed')) {
    if (parseInt(el.style.width) > 0) el.dataset.prevWidth = el.style.width;
    el.style.width = '';
    el.style.padding = '';
  } else {
    el.style.width = el.dataset.prevWidth || '250px';
    el.style.padding = '';
  }
}

function toggleRightSidebar() {
  const el = document.getElementById('rightSidebar');
  el.classList.toggle('collapsed');
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

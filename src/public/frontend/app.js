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
  const moveToSelect = document.getElementById('moveToSubdir');

  subdirSelect.innerHTML = '<option value="">Select subdirectory...</option>';
  moveToSelect.innerHTML = '<option value="">Select destination...</option>';

  subdirs.forEach(subdir => {
    const opt1 = document.createElement('option');
    opt1.value = subdir;
    opt1.textContent = subdir;
    subdirSelect.appendChild(opt1);

    const opt2 = document.createElement('option');
    opt2.value = subdir;
    opt2.textContent = subdir;
    moveToSelect.appendChild(opt2);
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

  // Update move destination dropdown to exclude current subdirectory
  const subdirs = await fetch(`${API_BASE}/buckets/${currentBucket}/subdirs`).then(r => r.json());
  const moveToSelect = document.getElementById('moveToSubdir');
  moveToSelect.innerHTML = '<option value="">Select destination...</option>';
  subdirs.forEach(dir => {
    if (dir !== currentSubdir) {
      const option = document.createElement('option');
      option.value = dir;
      option.textContent = dir;
      moveToSelect.appendChild(option);
    }
  });

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
async function saveFile() {
  if (!currentFiles[currentIndex]) return;

  const iframe = document.getElementById('formFrame');
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
let pendingMoveDestination = null;

async function moveFile() {
  const toSubdir = document.getElementById('moveToSubdir').value;
  if (!toSubdir || !currentFiles[currentIndex]) {
    alert('Please select a destination');
    return;
  }

  // Store destination and show modal
  pendingMoveDestination = toSubdir;
  document.getElementById('moveModal').style.display = 'block';
}

async function confirmMove(shouldSave) {
  // Hide modal
  document.getElementById('moveModal').style.display = 'none';
  
  const toSubdir = pendingMoveDestination;
  pendingMoveDestination = null;

  try {
    if (shouldSave) {
      const iframe = document.getElementById('formFrame');
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
    }

    // Move
    const moveResponse = await fetch(`${API_BASE}/buckets/move`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'XSRF-Token': getCsrfToken()
      },
      credentials: 'include',
      body: JSON.stringify({
        fromBucket: currentBucket,
        fromSubdir: currentSubdir,
        toBucket: currentBucket,
        toSubdir: toSubdir,
        filename: currentFiles[currentIndex]
      })
    });

    if (moveResponse.ok) {
      alert(`File moved to ${toSubdir}`);
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
  if (!currentFiles[currentIndex]) {
    alert('No file selected');
    return;
  }
  document.getElementById('submitModal').style.display = 'block';
}

// Confirm submit - placeholder for future implementation
function confirmSubmit() {
  document.getElementById('submitModal').style.display = 'none';
  alert('Functionality not implemented yet');
}

// Cancel submit - close modal
function cancelSubmit() {
  document.getElementById('submitModal').style.display = 'none';
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

// #endregion ------------------------------------------------------------------

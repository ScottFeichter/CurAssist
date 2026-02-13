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

const API_BASE = '/api';

let currentBucket = '';
let currentSubdir = '';
let currentFiles = [];
let currentIndex = 0;

// Initialize
async function init() {
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
  document.getElementById('bucketName').textContent = bucket;
  
  const subdirs = await fetch(`${API_BASE}/bucket/${bucket}/subdirs`).then(r => r.json());
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
  currentFiles = await fetch(`${API_BASE}/bucket/${currentBucket}/${subdir}/files`).then(r => r.json());
  currentIndex = 0;
  
  if (currentFiles.length > 0) {
    loadFile(0);
  } else {
    document.getElementById('fileInfo').textContent = 'No files in this directory';
  }
}

// Load specific file
async function loadFile(index) {
  if (index < 0 || index >= currentFiles.length) return;
  
  currentIndex = index;
  const filename = currentFiles[index];
  
  const content = await fetch(`${API_BASE}/file/${currentBucket}/${currentSubdir}/${filename}`).then(r => r.text());
  
  const iframe = document.getElementById('formFrame');
  iframe.srcdoc = content;
  
  document.getElementById('fileInfo').textContent = `File ${index + 1} of ${currentFiles.length}: ${filename}`;
  document.getElementById('headerInfo').textContent = `${currentBucket} / ${currentSubdir} / ${filename}`;
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
  
  await fetch(`${API_BASE}/file/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
  const toSubdir = document.getElementById('moveToSubdir').value;
  if (!toSubdir || !currentFiles[currentIndex]) return;
  
  if (toSubdir === currentSubdir) {
    alert('Cannot move to same directory');
    return;
  }
  
  // Save first
  await saveFile();
  
  // Move
  await fetch(`${API_BASE}/file/move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fromBucket: currentBucket,
      fromSubdir: currentSubdir,
      toBucket: currentBucket,
      toSubdir: toSubdir,
      filename: currentFiles[currentIndex]
    })
  });
  
  alert(`File moved to ${toSubdir}`);
  
  // Reload current directory
  loadSubdir();
}

// Initialize on load
init();

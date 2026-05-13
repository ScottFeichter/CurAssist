// #region ===================== CREATE BUCKET =================================

function createBucket() {
  selectedFile = null;
  document.getElementById('createBucketName').value = '';
  document.getElementById('createBucketEmpty').checked = false;
  document.getElementById('createBucketDirectSubmit').checked = false;
  document.getElementById('createServiceFromOrg').checked = false;
  document.getElementById('createBucketSpreadsheetSection').style.display = 'block';
  document.getElementById('uploadText').textContent = 'Click to select file or drag and drop';
  document.getElementById('createBucketBtn').disabled = true;
  document.getElementById('createBucketProgress').style.display = 'none';
  document.getElementById('createBucketProgress').textContent = '';
  document.getElementById('createBucketModal').style.display = 'block';
}

function toggleCreateBucketEmpty() {
  const isEmpty = document.getElementById('createBucketEmpty').checked;
  if (isEmpty) document.getElementById('createBucketDirectSubmit').checked = false;
  document.getElementById('createBucketSpreadsheetSection').style.display = isEmpty ? 'none' : 'block';
  document.getElementById('createBucketBtn').disabled = !isEmpty && !selectedFile;
}

function toggleCreateBucketDirectSubmit() {
  const isDirect = document.getElementById('createBucketDirectSubmit').checked;
  if (isDirect) {
    document.getElementById('createBucketEmpty').checked = false;
    document.getElementById('createBucketSpreadsheetSection').style.display = 'block';
    document.getElementById('createBucketBtn').disabled = !selectedFile;
  }
}

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
 * Decodes a base64-encoded xlsx report and triggers a browser download.
 * @param {string} base64
 * @param {string} filename
 */
function downloadReport(base64, filename) {
  const bytes = atob(base64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  const blob = new Blob([arr], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'import_report.xlsx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

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
  formData.append('createServiceFromOrg', document.getElementById('createServiceFromOrg').checked);

  document.getElementById('createBucketBtn').disabled = true;
  document.getElementById('createBucketProgress').style.display = 'block';
  document.getElementById('createBucketProgress').textContent = 'Working...';

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

    if (directSubmit && response.ok) {
      const orgs = data.orgs || [];
      const bucketName = data.bucketName;
      const dbResults = data.dbResults || [];
      const workbookBase64 = data.workbookBase64;

      let succeeded = 0;
      const failed = [];
      const sfsgResults = [];

      for (let i = 0; i < orgs.length; i++) {
        const org = orgs[i];
        document.getElementById('createBucketProgress').textContent = `Submitting ${i + 1} of ${orgs.length}: ${org.name}...`;

        if (dbResults[i] && dbResults[i].status === 'Failed') {
          sfsgResults.push({ row: i, status: 'Skipped', detail: 'DB creation failed', sfsgId: '' });
          failed.push({ name: org.name, error: 'Skipped — DB creation failed' });
          continue;
        }

        try {
          const hydrateRes = await fetch(`${API_BASE}/buckets/${bucketName}/incomplete/${org._id}`);
          if (!hydrateRes.ok) throw new Error(`Failed to load org: ${hydrateRes.status}`);

          const html = await hydrateRes.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');

          const payload = { organization: collectOrganization(doc) };
          const sfsg_id = await submitNewOrg(payload);

          await fetch(`${API_BASE}/buckets/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'XSRF-Token': getCsrfToken() },
            credentials: 'include',
            body: JSON.stringify({ id: org._id, sfsg_id })
          });

          sfsgResults.push({ row: i, status: 'Success', detail: '', sfsgId: sfsg_id });
          succeeded++;
        } catch (err) {
          sfsgResults.push({ row: i, status: 'Failed', detail: err.message, sfsgId: '' });
          failed.push({ name: org.name, error: err.message });
        }
      }

      document.getElementById('createBucketProgress').textContent = 'Building report...';
      try {
        const reportRes = await fetch(`${API_BASE}/buckets/build-report`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'XSRF-Token': getCsrfToken() },
          credentials: 'include',
          body: JSON.stringify({ workbookBase64, dbResults, sfsgResults, bucketName })
        });
        const reportData = await reportRes.json();
        if (reportData.report) downloadReport(reportData.report, reportData.reportFilename);
      } catch (reportErr) {
        console.error('Failed to build report:', reportErr);
      }

      document.getElementById('createBucketProgress').style.display = 'none';
      document.getElementById('createBucketModal').style.display = 'none';

      let msg = `Submitted ${succeeded} of ${orgs.length} orgs to SF Service Guide.`;
      if (failed.length) {
        msg += `\n\nFailed (${failed.length}):` + failed.map(f => `\n  • ${f.name}: ${f.error}`).join('');
      }
      document.getElementById('directSubmitResultMessage').textContent = msg;
      document.getElementById('directSubmitResultModal').style.display = 'block';
      init();
    } else if (response.ok) {
      document.getElementById('createBucketProgress').style.display = 'none';
      document.getElementById('createBucketModal').style.display = 'none';
      if (data.report) downloadReport(data.report, data.reportFilename);
      notify(data.message || 'Bucket created successfully');
      init();
    } else {
      document.getElementById('createBucketProgress').style.display = 'none';
      document.getElementById('createBucketModal').style.display = 'none';
      notify(data.error || 'Failed to create bucket');
    }
  } catch (error) {
    document.getElementById('createBucketProgress').style.display = 'none';
    document.getElementById('createBucketModal').style.display = 'none';
    notify('Error creating bucket: ' + error.message);
  } finally {
    document.getElementById('createBucketBtn').disabled = false;
  }
}

function cancelCreateBucket() {
  document.getElementById('createBucketModal').style.display = 'none';
  document.getElementById('createBucketName').value = '';
  document.getElementById('createBucketEmpty').checked = false;
  document.getElementById('createBucketDirectSubmit').checked = false;
  document.getElementById('createServiceFromOrg').checked = false;
  document.getElementById('createBucketSpreadsheetSection').style.display = 'block';
  selectedFile = null;
}

// #endregion ------------------------------------------------------------------

// #region ===================== IMPORT BUCKET ==================================

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

  const ids = new Set();
  if (useRange) {
    for (let i = rangeStart; i <= rangeEnd; i++) ids.add(i);
  }
  if (useSeries) {
    seriesRaw.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)).forEach(n => ids.add(n));
  }

  if (ids.size === 0) { errEl.textContent = 'No valid org IDs found.'; return; }

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

// #endregion ------------------------------------------------------------------

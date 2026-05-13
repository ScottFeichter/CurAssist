// #region ===================== DELETE BUCKET ==================================

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

function confirmDeleteBucket() {
  const bucketName = document.getElementById('deleteBucketSelect').value;
  if (!bucketName) { alert('Please select a bucket'); return; }
  document.getElementById('deleteBucketModal1').style.display = 'none';
  document.getElementById('deleteBucketWarning').textContent =
    `This will permanently delete ${bucketName} and all its subdirectories and files contained within. If you are sure you want to proceed type "delete" and press the delete button`;
  document.getElementById('deleteBucketConfirmInput').value = '';
  document.getElementById('deleteBucketModal2').style.display = 'block';
}

async function finalDeleteBucket() {
  const input = document.getElementById('deleteBucketConfirmInput').value;
  if (input !== 'delete') { alert('You must type "delete" exactly to confirm'); return; }
  const bucketName = document.getElementById('deleteBucketSelect').value;

  try {
    const response = await fetch(`${API_BASE}/buckets/${bucketName}`, {
      method: 'DELETE',
      headers: { 'XSRF-Token': getCsrfToken() },
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

function cancelDeleteBucket() {
  document.getElementById('deleteBucketModal1').style.display = 'none';
  document.getElementById('deleteBucketModal2').style.display = 'none';
  document.getElementById('deleteBucketConfirmInput').value = '';
}

// #endregion ------------------------------------------------------------------

// #region ===================== DELETE FILE ====================================

function deleteFile() {
  if (!currentFiles[currentIndex]) { alert('No file selected'); return; }
  document.getElementById('deleteModal1').style.display = 'block';
}

function confirmDelete() {
  document.getElementById('deleteModal1').style.display = 'none';
  document.getElementById('deleteModal2').style.display = 'block';
  document.getElementById('deleteConfirmInput').value = '';
}

async function finalDelete() {
  const input = document.getElementById('deleteConfirmInput').value;
  if (input !== 'delete') { alert('You must type "delete" exactly to confirm'); return; }

  try {
    const response = await fetch(`${API_BASE}/buckets/delete`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'XSRF-Token': getCsrfToken() },
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

function cancelDelete() {
  document.getElementById('deleteModal1').style.display = 'none';
  document.getElementById('deleteModal2').style.display = 'none';
  document.getElementById('deleteConfirmInput').value = '';
}

// #endregion ------------------------------------------------------------------

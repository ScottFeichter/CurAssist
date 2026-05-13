// #region ===================== SAVE ==========================================

/**
 * Syncs live DOM values back into HTML attributes so outerHTML captures current state.
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
 * @param {boolean} [silent=false] - If true, suppresses the feedback modal
 * @returns {Promise<boolean>} True if save succeeded, false otherwise
 */
async function saveFile(silent = false) {
  if (!currentFiles[currentIndex]) return false;

  const iframe = document.getElementById('formFrame');
  const iframeDoc = iframe.contentDocument;

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

    clearDirty();
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

// #endregion ------------------------------------------------------------------

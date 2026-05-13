// #region ===================== NOTIFICATIONS =================================

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
  if (e.key === 'Escape') {
    if (document.getElementById('notifyModal').style.display === 'block') {
      _closeNotify();
      return;
    }
    const visibleModal = Array.from(document.querySelectorAll('.modal')).find(
      m => m.style.display === 'block'
    );
    if (visibleModal) {
      const cancelBtn = visibleModal.querySelector('.cancel-btn');
      if (cancelBtn) cancelBtn.click();
    }
    return;
  }
  if (e.key === 'Enter') {
    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON' || tag === 'SELECT') return;
    if (document.getElementById('notifyModal').style.display === 'block') {
      _closeNotify();
      return;
    }
    const visibleModal = Array.from(document.querySelectorAll('.modal')).find(
      m => m.style.display === 'block'
    );
    if (visibleModal) {
      const okBtn = visibleModal.querySelector('.cancel-btn, .submit-btn, #notifyOkBtn');
      if (okBtn) okBtn.click();
    }
  }
});

// #endregion ------------------------------------------------------------------

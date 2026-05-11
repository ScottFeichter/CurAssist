// #region ===================== DIRTY FLAG ====================================

function markDirty() {
  isDirty = true;
}

function clearDirty() {
  isDirty = false;
}

/**
 * Attaches input/change listeners and a MutationObserver to the iframe document
 * so any user edit sets the dirty flag.
 */
function observeIframe(iframeDoc) {
  if (_iframeObserver) _iframeObserver.disconnect();

  iframeDoc.addEventListener('input', markDirty);
  iframeDoc.addEventListener('change', markDirty);

  _iframeObserver = new MutationObserver(markDirty);
  _iframeObserver.observe(iframeDoc.body, { childList: true, subtree: true });
}

/**
 * If dirty, shows the unsaved-changes modal and returns a Promise that resolves
 * to true (proceed) or false (cancel). Saves first if user clicks Save & Continue.
 * If not dirty, resolves to true immediately.
 */
function guardUnsaved() {
  if (!isDirty) return Promise.resolve(true);

  return new Promise(resolve => {
    const modal = document.getElementById('unsavedModal');
    modal.style.display = 'block';

    function cleanup() {
      modal.style.display = 'none';
      document.getElementById('unsavedSaveBtn').removeEventListener('click', onSave);
      document.getElementById('unsavedDiscardBtn').removeEventListener('click', onDiscard);
      document.getElementById('unsavedCancelBtn').removeEventListener('click', onCancel);
    }

    function onSave() {
      cleanup();
      saveFile(true).then(() => { clearDirty(); resolve(true); });
    }
    function onDiscard() {
      cleanup();
      clearDirty();
      resolve(true);
    }
    function onCancel() {
      cleanup();
      resolve(false);
    }

    document.getElementById('unsavedSaveBtn').addEventListener('click', onSave);
    document.getElementById('unsavedDiscardBtn').addEventListener('click', onDiscard);
    document.getElementById('unsavedCancelBtn').addEventListener('click', onCancel);
  });
}

window.addEventListener('beforeunload', function(e) {
  if (isDirty) {
    e.preventDefault();
    e.returnValue = '';
  }
});

// #endregion ------------------------------------------------------------------

// #region ===================== CSRF ==========================================

/**
 * Reads the XSRF-TOKEN cookie and returns its decoded value.
 * @returns {string}
 */
function getCsrfToken() {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

/**
 * Fetches a fresh CSRF token from the server and stores it in `csrfToken`.
 * @returns {Promise<void>}
 */
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

// #endregion ------------------------------------------------------------------

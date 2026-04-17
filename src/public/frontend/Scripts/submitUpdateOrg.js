// #region ===================== SUBMIT UPDATE ORG =============================
// POST /api/resources/:id/change_requests — update existing org via change request
// #endregion ------------------------------------------------------------------

// #region ===================== FUNCTIONS =====================================

/**
 * Submits a change request for an existing org in the SF Service Guide.
 * @param {{ organization: Object }} payload
 * @param {number|string} existingSfsgId
 * @returns {Promise<number|string>} The existing sfsg_id (unchanged)
 */
async function submitUpdateOrg(payload, existingSfsgId) {
  const { orgBody } = transformNewOrg(payload);
  const resource = orgBody.resources[0];

  // change_request wraps the org fields as a flat object
  const changeRequestBody = { change_request: { ...resource } };

  console.log('[SUBMIT] change_request body:', JSON.stringify(changeRequestBody, null, 2));

  const res = await fetch(`${SF_API}/resources/${existingSfsgId}/change_requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(changeRequestBody)
  });

  console.log('[SUBMIT] change_request response status:', res.status);

  if (!res.ok) {
    const errText = await res.text();
    console.log('[SUBMIT] change_request error status:', res.status);
    console.log('[SUBMIT] change_request error raw body:', errText);
    let errJson;
    try { errJson = JSON.parse(errText); } catch { errJson = { raw: errText.substring(0, 1000) }; }
    throw new Error(`Failed to submit change request: ${res.status} ${JSON.stringify(errJson)}`);
  }

  const data = await res.json();
  console.log('[SUBMIT] change_request response body:', JSON.stringify(data, null, 2));

  return existingSfsgId;
}

// #endregion ------------------------------------------------------------------

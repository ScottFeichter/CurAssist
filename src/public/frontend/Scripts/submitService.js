// #region ===================== SUBMIT SERVICE ================================
// POST /api/resources/{org_id}/services
// #endregion ------------------------------------------------------------------

// #region ===================== FUNCTIONS =====================================

/**
 * Posts a standalone service to an existing org in the SF API.
 * @param {{ service: Object }} payload
 * @returns {Promise<Object>} The created service data
 */
async function submitService(payload) {
  const { orgId, servicesBody } = transformServiceOnly(payload);

  if (!orgId) throw new Error('service_belongs_to_org is required for service submission');

  console.log('[SUBMIT] submitService orgId:', orgId);
  console.log('[SUBMIT] servicesBody being sent to SFSG:', JSON.stringify(servicesBody, null, 2));

  const res = await fetch(`${SF_API}/resources/${orgId}/services`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(servicesBody)
  });

  console.log('[SUBMIT] SFSG create service response status:', res.status);

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.log('[SUBMIT] SFSG create service error body:', JSON.stringify(err));
    throw new Error(`Failed to post service: ${res.status} ${JSON.stringify(err)}`);
  }

  const data = await res.json();
  console.log('[SUBMIT] Service created:', JSON.stringify(data, null, 2));
  return data;
}

// #endregion ------------------------------------------------------------------

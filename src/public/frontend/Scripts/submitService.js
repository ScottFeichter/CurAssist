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

  const res = await fetch(`${SF_API}/resources/${orgId}/services`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(servicesBody)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Failed to post service: ${res.status} ${JSON.stringify(err)}`);
  }

  const data = await res.json();
  console.log('Service created:', data);
  return data;
}

// #endregion ------------------------------------------------------------------

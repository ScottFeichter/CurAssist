// #region ===================== SUBMIT NEW ORG ================================
// 1. POST /api/resources        — create org, get back id
// 2. POST /api/resources/{id}/services — if org has services
// #endregion ------------------------------------------------------------------

// #region ===================== FUNCTIONS =====================================

/**
 * Submits a new organization to the SF API, then posts any associated services.
 * @param {{ organization: Object }} payload
 * @returns {Promise<number>} The new org's ID
 */
async function submitNewOrg(payload) {
  const { orgBody, services } = transformNewOrg(payload);
  console.log('[SUBMIT] orgBody being sent to SFSG:', JSON.stringify(orgBody, null, 2));
  console.log('[SUBMIT] services count:', services.length);

  // Step 1 — create org
  const orgRes = await fetch(`${SF_API}/resources`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orgBody)
  });

  console.log('[SUBMIT] SFSG create org response status:', orgRes.status);

  if (!orgRes.ok) {
    const err = await orgRes.json().catch(() => ({}));
    console.log('[SUBMIT] SFSG create org error body:', JSON.stringify(err));
    throw new Error(`Failed to create org: ${orgRes.status} ${JSON.stringify(err)}`);
  }

  const orgData = await orgRes.json();
  console.log('[SUBMIT] SFSG create org response body:', JSON.stringify(orgData, null, 2));
  const orgId = orgData.resources?.[0]?.resource?.id;
  if (!orgId) throw new Error('No org ID returned from server');

  console.log('[SUBMIT] Org created, sfsg_id:', orgId);

  // Step 2 — post services if any
  if (services.length > 0) {
    services.forEach((svc, i) => svc.id = -(i + 2));
    console.log('[SUBMIT] Posting', services.length, 'services to SFSG...');

    const svcRes = await fetch(`${SF_API}/resources/${orgId}/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ services })
    });

    console.log('[SUBMIT] SFSG create services response status:', svcRes.status);

    if (!svcRes.ok) {
      const err = await svcRes.json().catch(() => ({}));
      console.log('[SUBMIT] SFSG create services error body:', JSON.stringify(err));
      throw new Error(`Org created (id: ${orgId}) but failed to post services: ${svcRes.status} ${JSON.stringify(err)}`);
    }

    const svcData = await svcRes.json();
    console.log('[SUBMIT] Services created:', JSON.stringify(svcData, null, 2));
  }

  return orgId;
}

// #endregion ------------------------------------------------------------------

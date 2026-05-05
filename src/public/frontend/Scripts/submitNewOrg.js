// #region ===================== SUBMIT NEW ORG ================================
// Submit flow:
//   1. POST /api/resources — create org (scalars, addresses, phones, notes)
//   2. POST /api/resources/{id}/services — add services
//   3. POST /api/resources/{id}/change_requests — set fields SFSG ignores on create
//      (alternate_name, internal_note)
// #endregion ------------------------------------------------------------------

// #region ===================== FUNCTIONS =====================================

/**
 * Submits a new organization to the SF API.
 * Step 1: Create org with all fields.
 * Step 2: Post any associated services.
 * @param {{ organization: Object }} payload
 * @returns {Promise<number>} The new org's ID
 */
async function submitNewOrg(payload) {
  const { orgBody, services } = transformNewOrg(payload);

  console.log('[SUBMIT] Step 1 — creating org:', JSON.stringify(orgBody, null, 2));
  console.log('[SUBMIT] Services count:', services.length);

  // Step 1 — create org with all fields
  const orgRes = await fetch(`${SF_API}/resources`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orgBody)
  });

  console.log('[SUBMIT] SFSG create org response status:', orgRes.status);

  if (!orgRes.ok) {
    const errText = await orgRes.text();
    console.log('[SUBMIT] SFSG create org error status:', orgRes.status);
    console.log('[SUBMIT] SFSG create org error headers:', JSON.stringify(Object.fromEntries(orgRes.headers.entries())));
    console.log('[SUBMIT] SFSG create org error raw body:', errText);
    let errJson;
    try { errJson = JSON.parse(errText); } catch { errJson = { raw: errText.substring(0, 1000) }; }
    throw new Error(`Failed to create org: ${orgRes.status} ${JSON.stringify(errJson)}`);
  }

  const orgData = await orgRes.json();
  console.log('[SUBMIT] SFSG create org response body:', JSON.stringify(orgData, null, 2));
  const orgId = orgData.resources?.[0]?.resource?.id;
  if (!orgId) throw new Error('No org ID returned from server');

  console.log('[SUBMIT] Org created, sfsg_id:', orgId);

  // Step 2 — post services if any
  if (services.length > 0) {
    services.forEach((svc, i) => svc.id = -(i + 2));
    console.log('[SUBMIT] Step 2 — posting', services.length, 'services to SFSG...');
    console.log('[SUBMIT] Services payload:', JSON.stringify({ services }, null, 2));

    const svcRes = await fetch(`${SF_API}/resources/${orgId}/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ services })
    });

    console.log('[SUBMIT] SFSG create services response status:', svcRes.status);

    if (!svcRes.ok) {
      const errText = await svcRes.text();
      console.log('[SUBMIT] SFSG create services error status:', svcRes.status);
      console.log('[SUBMIT] SFSG create services error raw body:', errText);
      let errJson;
      try { errJson = JSON.parse(errText); } catch { errJson = { raw: errText.substring(0, 1000) }; }
      throw new Error(`Org created (id: ${orgId}) but failed to post services: ${svcRes.status} ${JSON.stringify(errJson)}`);
    }

    const svcData = await svcRes.json();
    console.log('[SUBMIT] Services created:', JSON.stringify(svcData, null, 2));
  }

  // Step 3 — change request for fields SFSG ignores on create
  const org = payload.organization;
  const changeFields = {};
  if (org.organization_alternate_name) changeFields.alternate_name = org.organization_alternate_name;
  if (org.organization_internal_notes) changeFields.internal_note = org.organization_internal_notes;

  if (Object.keys(changeFields).length > 0) {
    console.log('[SUBMIT] Step 3 — posting change_request:', JSON.stringify(changeFields));

    const crRes = await fetch(`${SF_API}/resources/${orgId}/change_requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ change_request: changeFields })
    });

    console.log('[SUBMIT] SFSG change_request response status:', crRes.status);

    if (!crRes.ok) {
      const errText = await crRes.text();
      console.log('[SUBMIT] SFSG change_request error:', errText);
    } else {
      const crData = await crRes.json();
      console.log('[SUBMIT] Change request created:', JSON.stringify(crData, null, 2));
    }
  }

  return orgId;
}

// #endregion ------------------------------------------------------------------

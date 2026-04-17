// #region ===================== SUBMIT NEW ORG ================================
// SFSG rejects populated addresses, phones, and notes on initial create (returns 500).
// The submit flow must be two steps:
//   1. POST /api/resources              — create org with scalar fields + empty arrays
//   2. POST /api/resources/{id}/change_requests — add addresses, phones, notes
//   3. POST /api/resources/{id}/services — if org has services
// #endregion ------------------------------------------------------------------

// #region ===================== FUNCTIONS =====================================

/**
 * Submits a new organization to the SF API.
 * Step 1: Create org with scalar fields only (SFSG rejects populated addresses/phones/notes on create).
 * Step 2: Send a change_request to add addresses, phones, and notes.
 * Step 3: Post any associated services.
 * @param {{ organization: Object }} payload
 * @returns {Promise<number>} The new org's ID
 */
async function submitNewOrg(payload) {
  const { orgBody, services } = transformNewOrg(payload);

  // Save the populated arrays before stripping
  const resource = orgBody.resources[0];
  const addresses = resource.addresses || [];
  const phones = resource.phones || [];
  const notes = resource.notes || [];

  // Strip arrays that SFSG rejects on create
  resource.addresses = [];
  resource.phones = [];
  resource.notes = [];

  console.log('[SUBMIT] Step 1 — creating org (scalars only):', JSON.stringify(orgBody, null, 2));
  console.log('[SUBMIT] Deferred for change_request — addresses:', addresses.length, 'phones:', phones.length, 'notes:', notes.length);
  console.log('[SUBMIT] Services count:', services.length);

  // Step 1 — create org with scalar fields only
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

  // Step 2 — change_request to add addresses, phones, notes
  if (addresses.length || phones.length || notes.length) {
    const changeRequest = {};
    if (addresses.length) changeRequest.addresses = addresses;
    if (phones.length) changeRequest.phones = phones;
    if (notes.length) changeRequest.notes = notes;

    console.log('[SUBMIT] Step 2 — sending change_request:', JSON.stringify({ change_request: changeRequest }, null, 2));

    const crRes = await fetch(`${SF_API}/resources/${orgId}/change_requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ change_request: changeRequest })
    });

    console.log('[SUBMIT] SFSG change_request response status:', crRes.status);

    if (!crRes.ok) {
      const errText = await crRes.text();
      console.log('[SUBMIT] SFSG change_request error raw body:', errText);
      let errJson;
      try { errJson = JSON.parse(errText); } catch { errJson = { raw: errText.substring(0, 1000) }; }
      console.log('[SUBMIT] WARNING: Org created (id: ' + orgId + ') but change_request failed: ' + crRes.status);
      // Don't throw — org was created successfully, change_request is best-effort
    } else {
      const crData = await crRes.json();
      console.log('[SUBMIT] Change request created:', JSON.stringify(crData, null, 2));
    }
  }

  // Step 3 — post services if any
  if (services.length > 0) {
    services.forEach((svc, i) => svc.id = -(i + 2));
    console.log('[SUBMIT] Step 3 — posting', services.length, 'services to SFSG...');

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

  return orgId;
}

// #endregion ------------------------------------------------------------------

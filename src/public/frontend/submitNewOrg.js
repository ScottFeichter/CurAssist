// ============================================================
// SUBMIT NEW ORG
// 1. POST /api/resources        — create org, get back id
// 2. POST /api/resources/{id}/services — if org has services
// ============================================================

async function submitNewOrg(payload) {
  const { orgBody, services } = transformNewOrg(payload);

  // Step 1 — create org
  const orgRes = await fetch(`${SF_API}/resources`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(orgBody)
  });

  if (!orgRes.ok) {
    const err = await orgRes.json().catch(() => ({}));
    throw new Error(`Failed to create org: ${orgRes.status} ${JSON.stringify(err)}`);
  }

  const orgData = await orgRes.json();
  const orgId = orgData.resources?.[0]?.resource?.id;
  if (!orgId) throw new Error('No org ID returned from server');

  console.log('Org created, id:', orgId);

  // Step 2 — post services if any
  if (services.length > 0) {
    // Assign unique negative IDs per service
    services.forEach((svc, i) => svc.id = -(i + 2));

    const svcRes = await fetch(`${SF_API}/resources/${orgId}/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ services })
    });

    if (!svcRes.ok) {
      const err = await svcRes.json().catch(() => ({}));
      throw new Error(`Org created (id: ${orgId}) but failed to post services: ${svcRes.status} ${JSON.stringify(err)}`);
    }

    const svcData = await svcRes.json();
    console.log('Services created:', svcData);
  }

  return orgId;
}

// ============================================================
// SUBMIT SERVICE (to existing org)
// POST /api/resources/{org_id}/services
// ============================================================

const SF_API = 'https://www.sfserviceguide.org/api';

async function submitService(payload) {
  const { orgId, servicesBody } = transformServiceOnly(payload);

  if (!orgId) throw new Error('service_belongs_to_org is required for service submission');

  const res = await fetch(`${SF_API}/resources/${orgId}/services`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
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

// #region ===================== CONSTANTS =====================================

/** @type {string} Base URL for SF Service Guide API proxy */
const SF_API = '/api/sf';

// #endregion ------------------------------------------------------------------

// #region ===================== HELPERS =======================================

/**
 * Merges top-level and sub categories, resolves IDs from lookup table, filters unknowns.
 * @param {string[]} topCats
 * @param {string[]} subCats
 * @returns {{ name: string, id: number|null, top_level: boolean, featured: boolean }[]}
 */
function transformCategories(topCats, subCats) {
  return [...topCats, ...subCats]
    .map(name => {
      const id = categoryLookup[name] ?? null;
      return { name, id, top_level: false, featured: false };
    })
    .filter(c => c.id !== null);
}

/**
 * Merges top-level and sub eligibilities, resolves IDs from lookup table, filters unknowns.
 * @param {string[]} topEligibs
 * @param {string[]} subEligibs
 * @returns {{ name: string, id: number|null, feature_rank: null }[]}
 */
function transformEligibilities(topEligibs, subEligibs) {
  return [...topEligibs, ...subEligibs]
    .map(name => {
      const id = eligibilityLookup[name] ?? null;
      return { name, id, feature_rank: null };
    })
    .filter(e => e.id !== null);
}

/**
 * Converts collected hours object into SF API schedule_days format.
 * @param {Object} service_hours
 * @returns {{ schedule_days: { day: string, opens_at: string|null, closes_at: string|null }[] }}
 */
function transformHours(service_hours) {
  const dayMap = { M: 'Monday', T: 'Tuesday', W: 'Wednesday', Th: 'Thursday', F: 'Friday', Sa: 'Saturday', Su: 'Sunday' };
  const schedule_days = [];
  for (const [key, val] of Object.entries(service_hours)) {
    if (!val.start.time && !val.end.time) continue;
    schedule_days.push({
      day:        dayMap[key],
      opens_at:   val.start.time || null,
      closes_at:  val.end.time   || null
    });
  }
  return { schedule_days };
}

/**
 * Converts collected location objects into SF API address format.
 * @param {{ location_name: string, address_1: string, address_2: string, city: string, state: string, zip: string }[]} locations
 * @returns {Object[]}
 */
function transformLocations(locations) {
  return locations.map(loc => {
    const addr = {};
    if (loc.location_name) addr.name            = loc.location_name;
    if (loc.address_1)     addr.address_1       = loc.address_1;
    if (loc.address_2)     addr.address_2       = loc.address_2;
    if (loc.city)          addr.city            = loc.city;
    if (loc.state)         addr.state_province  = loc.state;
    if (loc.zip)           addr.postal_code     = loc.zip;
    return addr;
  }).filter(addr => Object.keys(addr).length > 0);
}

/**
 * Wraps note strings into SF API note objects.
 * @param {string[]} notes
 * @returns {{ note: string }[]}
 */
function transformNotes(notes) {
  return notes.map(n => ({ note: n }));
}

/**
 * Filters empty phones and converts to SF API phone format.
 * @param {{ phone_number: string, phone_name: string }[]} phones
 * @returns {{ number: string|null, description: string|null }[]}
 */
function transformPhones(phones) {
  return phones
    .filter(p => p.phone_number)
    .map(p => {
      const phone = { number: p.phone_number };
      if (p.phone_name) phone.service_type = p.phone_name;
      return phone;
    });
}

// #endregion ------------------------------------------------------------------

// #region ===================== TRANSFORMS ====================================

/**
 * Transforms a collected service object into SF API service format.
 * @param {Object} svc - Collected service data from collector.js
 * @returns {Object} SF API-shaped service object
 */
function transformService(svc) {
  const service = {
    id:           -1,
    name:         svc.service_name || null,
    addresses:    transformLocations(svc.service_locations),
    phones:       transformPhones(svc.service_phones || []),
    schedule:     transformHours(svc.service_hours),
    notes:        transformNotes(svc.service_markdown_notes),
    categories:   transformCategories(svc.service_top_categories, svc.service_sub_categories),
    eligibilities: transformEligibilities(svc.service_top_eligibilities, svc.service_sub_eligibilities),
    shouldInheritScheduleFromParent: false
  };
  if (svc.service_alternate_name)           service.alternate_name          = svc.service_alternate_name;
  if (svc.service_email)                    service.email                   = svc.service_email;
  if (svc.service_description)              service.long_description        = svc.service_description;
  if (svc.service_short_description)        service.short_description       = svc.service_short_description;
  if (svc.service_application_process)      service.application_process     = svc.service_application_process;
  if (svc.service_required_documents)       service.required_documents      = svc.service_required_documents;
  if (svc.service_interpretation_services)  service.interpretation_services = svc.service_interpretation_services;
  if (svc.service_internal_notes)           service.internal_note           = svc.service_internal_notes;
  if (svc.service_cost)                     service.fee                     = svc.service_cost;
  if (svc.service_wait_time)                service.wait_time               = svc.service_wait_time;
  if (svc.service_website)                  service.url                     = svc.service_website;
  return service;
}

/**
 * Transforms a new org payload into SF API format, including nested services.
 * @param {{ organization: Object }} payload
 * @returns {{ orgBody: Object, services: Object[] }}
 */
function transformNewOrg(payload) {
  console.log('[TRANSFORM] transformNewOrg input:', JSON.stringify(payload).substring(0, 500));
  const org = payload.organization;
  const services = Object.values(org.services || {}).map(transformService);

  const resource = {
    name:      org.organization_name || null,
    addresses: transformLocations(org.organization_locations),
    phones:    transformPhones(org.organization_phones),
    notes:     transformNotes(org.organization_markdown_notes),
    schedule:  { schedule_days: [] }
  };
  if (org.organization_alternate_name) resource.alternate_name   = org.organization_alternate_name;
  if (org.organization_email)          resource.email            = org.organization_email;
  if (org.organization_website)        resource.website          = org.organization_website;
  if (org.organization_description)    resource.long_description = org.organization_description;
  if (org.organization_legal_status)   resource.legal_status     = org.organization_legal_status;
  if (org.organization_internal_notes) resource.internal_note    = org.organization_internal_notes;

  const result = { orgBody: { resources: [resource] }, services };
  console.log('[TRANSFORM] transformNewOrg output orgBody:', JSON.stringify(result.orgBody, null, 2));
  console.log('[TRANSFORM] transformNewOrg output services count:', services.length);
  if (services.length) console.log('[TRANSFORM] first service:', JSON.stringify(services[0]).substring(0, 300));
  return result;
}

/**
 * Transforms a standalone service payload for posting to an existing org.
 * @param {{ service: Object }} payload
 * @returns {{ orgId: string, servicesBody: { services: Object[] } }}
 */
function transformServiceOnly(payload) {
  console.log('[TRANSFORM] transformServiceOnly input:', JSON.stringify(payload).substring(0, 500));
  const svc = payload.service;
  const orgId = svc.service_belongs_to_org;
  const transformed = transformService(svc);
  console.log('[TRANSFORM] transformServiceOnly orgId:', orgId);
  console.log('[TRANSFORM] transformServiceOnly output:', JSON.stringify(transformed).substring(0, 300));
  return { orgId, servicesBody: { services: [transformed] } };
}

// #endregion ------------------------------------------------------------------

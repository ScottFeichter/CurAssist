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
  return locations.map(loc => ({
    name:       loc.location_name || null,
    address_1:  loc.address_1     || null,
    address_2:  loc.address_2     || null,
    city:       loc.city          || null,
    state_province: loc.state     || null,
    postal_code: loc.zip          || null
  }));
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
    .map(p => ({
      number:      p.phone_number || null,
      description: p.phone_name   || null
    }));
}

// #endregion ------------------------------------------------------------------

// #region ===================== TRANSFORMS ====================================

/**
 * Transforms a collected service object into SF API service format.
 * @param {Object} svc - Collected service data from collector.js
 * @returns {Object} SF API-shaped service object
 */
function transformService(svc) {
  return {
    id:                       -1,
    name:                     svc.service_name                  || null,
    alternate_name:           svc.service_alternate_name        || null,
    email:                    svc.service_email                 || null,
    long_description:         svc.service_description           || null,
    short_description:        svc.service_short_description     || null,
    application_process:      svc.service_application_process   || null,
    required_documents:       svc.service_required_documents    || null,
    interpretation_services:  svc.service_interpretation_services || null,
    internal_note:            svc.service_internal_notes        || null,
    fee:                      svc.service_cost                  || null,
    wait_time:                svc.service_wait_time             || null,
    url:                      svc.service_website               || null,
    addresses:                transformLocations(svc.service_locations),
    phones:                   transformPhones(svc.service_phones || []),
    schedule:                 transformHours(svc.service_hours),
    notes:                    transformNotes(svc.service_markdown_notes),
    categories:               transformCategories(svc.service_top_categories, svc.service_sub_categories),
    eligibilities:            transformEligibilities(svc.service_top_eligibilities, svc.service_sub_eligibilities),
    shouldInheritScheduleFromParent: false
  };
}

/**
 * Transforms a new org payload into SF API format, including nested services.
 * @param {{ organization: Object }} payload
 * @returns {{ orgBody: Object, services: Object[] }}
 */
function transformNewOrg(payload) {
  const org = payload.organization;
  const services = Object.values(org.services || {}).map(transformService);

  return {
    orgBody: {
      resources: [{
        name:           org.organization_name          || null,
        alternate_name: org.organization_alternate_name || null,
        email:          org.organization_email         || null,
        website:        org.organization_website       || null,
        long_description: org.organization_description || null,
        legal_status:   org.organization_legal_status  || null,
        internal_note:  org.organization_internal_notes || null,
        addresses:      transformLocations(org.organization_locations),
        phones:         transformPhones(org.organization_phones),
        notes:          transformNotes(org.organization_markdown_notes),
        schedule:       { schedule_days: [] }
      }]
    },
    services
  };
}

/**
 * Transforms a standalone service payload for posting to an existing org.
 * @param {{ service: Object }} payload
 * @returns {{ orgId: string, servicesBody: { services: Object[] } }}
 */
function transformServiceOnly(payload) {
  const svc = payload.service;
  const orgId = svc.service_belongs_to_org;
  const transformed = transformService(svc);
  return { orgId, servicesBody: { services: [transformed] } };
}

// #endregion ------------------------------------------------------------------

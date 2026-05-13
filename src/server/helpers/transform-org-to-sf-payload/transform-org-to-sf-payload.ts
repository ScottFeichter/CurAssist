import { extendedConsole as console } from '../../../streams/consoles/customConsoles';
import { log } from '../../../utils/logger/logger-setup/logger-wrapper';
import { IOrg } from '../../../database/models/org.model';
import { topCategoryNames } from '../lookup-tables/sfsg-outgoing';

console.enter();

/**
 * Transforms an IOrg document into the SF Service Guide API payload shape.
 * Mirrors the browser-side transformNewOrg() in transform.js.
 * @param org - The org document to transform
 */
export function transformOrgToSFPayload(org: IOrg): { orgBody: any, services: any[] } {
  log.enter('transformOrgToSFPayload()', log.brack);

  const services = org.services.map((svc, i) => ({
    id:                             -(i + 2),
    name:                           svc.name                     || null,
    alternate_name:                 svc.alternate_name            || null,
    email:                          svc.email                    || null,
    long_description:               svc.long_description         || null,
    short_description:              svc.short_description        || null,
    application_process:            svc.application_process      || null,
    required_documents:             svc.required_documents       || null,
    interpretation_services:        svc.interpretation_services  || null,
    internal_note:                  svc.internal_note            || null,
    fee:                            svc.fee                      || null,
    wait_time:                      svc.wait_time                || null,
    url:                            svc.url                      || null,
    addresses:                      svc.addresses                || [],
    phones:                         (svc.phones || []).map(p => ({ number: p.number, ...(p.service_type ? { service_type: p.service_type } : {}), ...(p.extension ? { extension: p.extension } : {}) })),
    schedule:                       svc.schedule                 || { schedule_days: [] },
    notes:                          svc.notes                    || [],
    categories:                     (svc.categories || []).map(name => ({ name, id: null, top_level: topCategoryNames.has(name), featured: false })),
    eligibilities:                  (svc.eligibilities || []).map(name => ({ name, id: null, feature_rank: null })),
    shouldInheritScheduleFromParent: svc.shouldInheritScheduleFromParent ?? true
  }));

  const orgBody = {
    resources: [{
      name:             org.name             || null,
      alternate_name:   org.alternate_name   || null,
      email:            org.email            || null,
      website:          org.website          || null,
      long_description: org.long_description || null,
      legal_status:     org.legal_status     || null,
      internal_note:    org.internal_note    || null,
      addresses:        org.addresses        || [],
      phones:           (org.phones || []).map(p => ({ number: p.number, ...(p.service_type ? { service_type: p.service_type } : {}), ...(p.extension ? { extension: p.extension } : {}) })),
      notes:            org.notes            || [],
      schedule:         org.schedule         || { schedule_days: [] }
    }]
  };

  log.retrn('transformOrgToSFPayload()', log.kcarb);
  return { orgBody, services };
}

console.leave();

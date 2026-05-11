import { extendedConsole as console } from '../../../streams/consoles/customConsoles';
import { log } from '../../../utils/logger/logger-setup/logger-wrapper';
import fs from 'fs/promises';
import path from 'path';
import { IOrg } from '../../../database/models/org.model';
const { injectInput, injectTextarea, injectPhoneList, injectLocationDiv } = require('../../../../content/Templates/inject-values');

console.enter();

const TEMPLATE_PATH = path.join(process.cwd(), 'content', 'Templates', 'orgServTemplate-combined.html');

/** Converts minutes from midnight to "HH:MM" 24h format. */
function minutesToTime(minutes: number): string {
  if (!minutes && minutes !== 0) return '';
  const hh = Math.floor(minutes / 60).toString().padStart(2, '0');
  const mm = (minutes % 60).toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

/**
 * Hydrates the combined HTML template with data from an Org document.
 * Returns the populated HTML string ready to be served to the iframe.
 * @param org - The Org document to hydrate the template with
 */
export async function hydrateTemplate(org: IOrg): Promise<string> {
  log.enter('hydrateTemplate()', log.brack);

  let html = await fs.readFile(TEMPLATE_PATH, 'utf-8');

  html = html.replace('<body', `<body data-org-id="${org._id}"`);

  if (org.sfsg_id && !org.spreadsheetService) {
    html = html.replace('let importedFileFromSFSG = false;', 'let importedFileFromSFSG = true;');
  }
  if (org.sfsg_id) {
    html = html.replace('value="TBD" placeholder="\u2014"', `value="${org.sfsg_id}" placeholder="\u2014"`);
  }

  // ── Org scalar fields
  html = injectInput(html,    'organization_name',           org.name             || '');
  html = injectInput(html,    'organization_alternate_name', org.alternate_name   || '');
  html = injectInput(html,    'organization_website',        org.website          || '');
  html = injectInput(html,    'organization_email',          org.email            || '');
  html = injectInput(html,    'organization_legal_status',   org.legal_status     || '');
  html = injectTextarea(html, 'organization_description',    org.long_description || '');
  html = injectTextarea(html, 'organization_internal_notes', org.internal_note    || '');

  // ── Org schedule/hours
  if (org.schedule?.schedule_days?.length) {
    const dayIndex: Record<string, number> = { Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3, Friday: 4, Saturday: 5, Sunday: 6 };
    const times: [string, string][] = Array(7).fill(null).map(() => ['', '']);
    for (const sd of org.schedule.schedule_days) {
      const idx = dayIndex[sd.day];
      if (idx != null) times[idx] = [minutesToTime(sd.opens_at), minutesToTime(sd.closes_at)];
    }
    let timeIdx = 0;
    html = html.replace(/(<input type="time" value=")(")/, (match, prefix, suffix) => {
      if (timeIdx >= 14) return match;
      const dayPos = Math.floor(timeIdx / 2);
      const isEnd = timeIdx % 2 === 1;
      timeIdx++;
      const val = isEnd ? times[dayPos][1] : times[dayPos][0];
      return val ? `${prefix}${val}"` : match;
    });
  }

  // ── Org markdown notes
  if (org.notes?.length) {
    const notesHtml = org.notes.map(n => `<li>${n.note}</li>`).join('');
    html = html.replace(
      /(<ul[^>]*id="organization_markdown_notes"[^>]*>)([\s\S]*?)(<\/ul>)/,
      `$1${notesHtml}$3`
    );
  }

  // ── Org addresses
  if (org.addresses?.length) {
    const locHtml = org.addresses.map((a, i) => {
      const addrParts = [a.address_1, a.address_2, a.city, a.state_province, a.postal_code].filter(Boolean).join('  ');
      return `<div class="location-row" data-name="${a.name || ''}" data-addr1="${a.address_1 || ''}" data-addr2="${a.address_2 || ''}" data-city="${a.city || ''}" data-state="${a.state_province || ''}" data-zip="${a.postal_code || ''}"><span class="location-row-num">${i + 1}.</span><span class="location-row-name">${a.name || ''}</span><span class="location-row-addr">${addrParts}</span><span class="location-row-actions"><button type="button" class="edit-btn"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg> EDIT</button><button type="button" class="remove-btn"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg> REMOVE</button></span></div>`;
    }).join('');
    html = html.replace(
      /<div[^>]*id="organization_locations"[^>]*>\s*<\/div>/,
      `<div id="organization_locations" class="app-components-edit-EditAddress-module__addressList--sQxt1 location-row-list">${locHtml}</div>`
    );
  }

  // ── Org phones
  if (org.phones?.length) {
    const phoneHtml = org.phones.map((p, i) =>
      `<li class="phone-row" data-number="${p.number}" data-type="${p.service_type || ''}"><span class="phone-row-num">${i + 1}.</span><span class="phone-row-name">${p.service_type || ''}</span><span class="phone-row-number">${p.number}</span><span class="phone-row-actions"><button type="button" class="edit-btn"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg> EDIT</button><button type="button" class="remove-btn"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg> REMOVE</button></span></li>`
    ).join('');
    html = html.replace(
      /<ul[^>]*id="organization_phones"[^>]*>\s*<\/ul>/,
      `<ul id="organization_phones" class="edit--section--list--item--sublist phone-row-list">${phoneHtml}</ul>`
    );
  }

  // ── Spreadsheet Service
  if (org.spreadsheetService) {
    const svc = org.spreadsheetService;
    html = injectInput(html,    'service_name',                    svc.name                     || '');
    html = injectInput(html,    'service_alternate_name',          svc.alternate_name            || '');
    html = injectInput(html,    'service_email',                   svc.email                    || '');
    html = injectInput(html,    'service_website',                 svc.url                      || '');
    html = injectInput(html,    'service_cost',                    svc.fee                      || '');
    html = injectInput(html,    'service_wait_time',               svc.wait_time                || '');
    html = injectTextarea(html, 'service_description',             svc.long_description         || '');
    html = injectTextarea(html, 'service_short_description',       svc.short_description        || '');
    html = injectTextarea(html, 'service_application_process',     svc.application_process      || '');
    html = injectTextarea(html, 'service_required_documents',      svc.required_documents       || '');
    html = injectTextarea(html, 'service_interpretation_services', svc.interpretation_services  || '');
    html = injectTextarea(html, 'service_clinician_actions',       svc.clinician_actions        || '');
    html = injectTextarea(html, 'service_internal_notes',          svc.internal_note            || '');

    if (svc.phones?.length) {
      const phoneHtml = svc.phones.map((p: any) => `<li data-number="${p.number}" data-type="${p.service_type || ''}"><strong>${p.service_type || ''}</strong> ${p.number}</li>`).join('');
      html = injectPhoneList(html, 'service_phones', phoneHtml);
    }
    if (svc.addresses?.length) {
      const locHtml = svc.addresses.map((a: any) => `<div>${a.address_1 || ''}, ${a.city || ''}, ${a.state_province || ''} ${a.postal_code || ''}</div>`).join('');
      html = injectLocationDiv(html, 'service_locations', locHtml);
    }
    if (svc.categories?.length) {
      const subCats = new Set(svc.sub_categories || []);
      const topCats = svc.categories.filter((c: any) => !subCats.has(c));
      if (topCats.length) {
        const pillsHtml = topCats.map((c: any) => `<div class="Select-value"><span class="Select-value-icon" aria-hidden="true">×</span><span class="Select-value-label">${c}</span></div>`).join('');
        html = html.replace(/(<div[^>]*id="service_top_categories"[^>]*>)(\s*)(<div class="Select-placeholder">)/, `$1${pillsHtml}<div class="Select-placeholder" style="display:none;">`);
      }
      if (subCats.size) {
        const pillsHtml = [...subCats].map((c: any) => `<div class="Select-value"><span class="Select-value-icon" aria-hidden="true">×</span><span class="Select-value-label">${c}</span></div>`).join('');
        html = html.replace(/(<div[^>]*id="service_sub_categories"[^>]*>)(\s*)(<div class="Select-placeholder">)/, `$1${pillsHtml}<div class="Select-placeholder" style="display:none;">`);
      }
    }
    if (svc.eligibilities?.length) {
      const subEligibs = new Set(svc.sub_eligibilities || []);
      const topEligibs = svc.eligibilities.filter((e: any) => !subEligibs.has(e));
      if (topEligibs.length) {
        const pillsHtml = topEligibs.map((e: any) => `<div class="Select-value"><span class="Select-value-icon" aria-hidden="true">×</span><span class="Select-value-label">${e}</span></div>`).join('');
        html = html.replace(/(<div[^>]*id="service_top_eligibilities"[^>]*>)(\s*)(<div class="Select-placeholder">)/, `$1${pillsHtml}<div class="Select-placeholder" style="display:none;">`);
      }
      if (subEligibs.size) {
        const pillsHtml = [...subEligibs].map((e: any) => `<div class="Select-value"><span class="Select-value-icon" aria-hidden="true">×</span><span class="Select-value-label">${e}</span></div>`).join('');
        html = html.replace(/(<div[^>]*id="service_sub_eligibilities"[^>]*>)(\s*)(<div class="Select-placeholder">)/, `$1${pillsHtml}<div class="Select-placeholder" style="display:none;">`);
      }
    }
    if (svc.service_belongs_to_org) {
      html = injectInput(html, 'serviceBelongsToOrg', svc.service_belongs_to_org);
    }
  }

  // ── Services
  if (org.services?.length) {
    const templateMatch = html.match(/<div[^>]*id="serviceDivOrganization"[\s\S]*?(?=<!---={10,}\s*EDIT SERVICES ENDS)/);
    const serviceTemplateHtml = templateMatch ? templateMatch[0] : null;

    if (serviceTemplateHtml) {
      const populatedServices = org.services.map((svc, i) => {
        let s = serviceTemplateHtml;
        s = s.replace('id="serviceDivOrganization"', `id="service-org-${i}"`);
        s = injectInput(s,    'service_name',                    svc.name                     || '');
        s = injectInput(s,    'service_alternate_name',          svc.alternate_name            || '');
        s = injectInput(s,    'service_email',                   svc.email                    || '');
        s = injectInput(s,    'service_website',                 svc.url                      || '');
        s = injectInput(s,    'service_cost',                    svc.fee                      || '');
        s = injectInput(s,    'service_wait_time',               svc.wait_time                || '');
        s = injectTextarea(s, 'service_description',             svc.long_description         || '');
        s = injectTextarea(s, 'service_short_description',       svc.short_description        || '');
        s = injectTextarea(s, 'service_application_process',     svc.application_process      || '');
        s = injectTextarea(s, 'service_required_documents',      svc.required_documents       || '');
        s = injectTextarea(s, 'service_interpretation_services', svc.interpretation_services  || '');
        s = injectTextarea(s, 'service_clinician_actions',       svc.clinician_actions        || '');
        s = injectTextarea(s, 'service_internal_notes',          svc.internal_note            || '');

        if (svc.phones?.length) {
          const phoneHtml = svc.phones.map((p: any) => `<li data-number="${p.number}" data-type="${p.service_type || ''}"><strong>${p.service_type || ''}</strong> ${p.number}</li>`).join('');
          s = injectPhoneList(s, 'service_phones', phoneHtml);
        }
        if (svc.addresses?.length) {
          const locHtml = svc.addresses.map((a: any) => `<li data-address1="${a.address_1 || ''}" data-city="${a.city || ''}" data-state="${a.state_province || ''}" data-zip="${a.postal_code || ''}">${a.address_1 || ''}, ${a.city || ''}, ${a.state_province || ''} ${a.postal_code || ''}</li>`).join('');
          s = s.replace(/(<ul[^>]*id="service_locations"[^>]*>)([\s\S]*?)(<\/ul>)/, `$1${locHtml}$3`);
        }
        if (svc.categories?.length) {
          const subCats = new Set(svc.sub_categories || []);
          const topCats = svc.categories.filter((c: any) => !subCats.has(c));
          if (topCats.length) {
            const pillsHtml = topCats.map((c: any) => `<div class="Select-value"><span class="Select-value-icon" aria-hidden="true">×</span><span class="Select-value-label">${c}</span></div>`).join('');
            s = s.replace(/(<div[^>]*id="service_top_categories"[^>]*>)(\s*)(<div class="Select-placeholder">)/, `$1${pillsHtml}<div class="Select-placeholder" style="display:none;">`);
          }
          if (subCats.size) {
            const pillsHtml = [...subCats].map((c: any) => `<div class="Select-value"><span class="Select-value-icon" aria-hidden="true">×</span><span class="Select-value-label">${c}</span></div>`).join('');
            s = s.replace(/(<div[^>]*id="service_sub_categories"[^>]*>)(\s*)(<div class="Select-placeholder">)/, `$1${pillsHtml}<div class="Select-placeholder" style="display:none;">`);
          }
        }
        if (svc.eligibilities?.length) {
          const subEligibs = new Set(svc.sub_eligibilities || []);
          const topEligibs = svc.eligibilities.filter((e: any) => !subEligibs.has(e));
          if (topEligibs.length) {
            const pillsHtml = topEligibs.map((e: any) => `<div class="Select-value"><span class="Select-value-icon" aria-hidden="true">×</span><span class="Select-value-label">${e}</span></div>`).join('');
            s = s.replace(/(<div[^>]*id="service_top_eligibilities"[^>]*>)(\s*)(<div class="Select-placeholder">)/, `$1${pillsHtml}<div class="Select-placeholder" style="display:none;">`);
          }
          if (subEligibs.size) {
            const pillsHtml = [...subEligibs].map((e: any) => `<div class="Select-value"><span class="Select-value-icon" aria-hidden="true">×</span><span class="Select-value-label">${e}</span></div>`).join('');
            s = s.replace(/(<div[^>]*id="service_sub_eligibilities"[^>]*>)(\s*)(<div class="Select-placeholder">)/, `$1${pillsHtml}<div class="Select-placeholder" style="display:none;">`);
          }
        }
        return s;
      }).join('\n');

      html = html.replace(
        '<div class="edit--orgServices" id="orgServicesDiv"></div>',
        `<div class="edit--orgServices" id="orgServicesDiv">${populatedServices}</div>`
      );

      const navLis = org.services.map((svc, i) =>
        `<li class="app-components-edit-EditSidebar-module__listItem--HBckV" data-service-id="service-org-${i}"><a href="#service-org-${i}" onclick="event.preventDefault(); var t=document.getElementById('service-org-${i}'); if(t) t.scrollIntoView({behavior:'smooth'});">${svc.name || 'Service ' + (i + 1)}</a></li>`
      ).join('\n');

      html = html.replace(
        /(<ul[^>]*id="servicesList"[^>]*>)\s*(<\/ul>)/,
        `$1\n${navLis}\n$2`
      );
    }
  }

  log.retrn('hydrateTemplate()', log.kcarb);
  return '<!DOCTYPE html>\n' + html;
}

console.leave();

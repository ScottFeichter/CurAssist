// #region ===================== IMPORTS =======================================
import { extendedConsole as console } from '../../streams/consoles/customConsoles';
import { log } from '../../utils/logger/logger-setup/logger-wrapper';
import fs from 'fs/promises';
import path from 'path';
import * as XLSX from 'xlsx';
import { Bucket } from '../../database/models/bucket.model';
import { Org, IOrg } from '../../database/models/org.model';
import { orgFieldMap, serviceFieldMap, organizationLocationFieldMap, organizationPhoneFieldMap } from './buckets-map';
import {
  sanitizePhoneName,
  sanitizeOrganizationPhones,
  sanitizeLocationName,
  sanitizeAddress,
  sanitizeCity,
  sanitizeState,
  sanitizeZip,
  sanitizeName,
  sanitizeAlternateName,
  sanitizeWebsite,
  sanitizeEmail,
  sanitizeDescription,
  sanitizeInternalNotes,
  sanitizeMarkdownNotes,
  sanitizeOrganizationLegalStatus,
  sanitizeServiceShortDescription,
  sanitizeServiceApplicationProcess,
  sanitizeServiceRequiredDocuments,
  sanitizeServiceInterpretationServices,
  sanitizeServiceClinicianActions,
  sanitizeServiceCost,
  sanitizeServiceWaitTime,
  sanitizeServiceCategories,
  sanitizeServiceEligibilitiesList
} from './bucket-sanitizers';
const { injectInput, injectTextarea, injectPhoneList, injectLocationDiv } = require('../../../content/Templates/inject-values');
// #endregion ------------------------------------------------------------------

console.enter();

// #region ===================== HELPERS =======================================

const TEMPLATE_PATH = path.join(process.cwd(), 'content', 'Templates', 'orgServTemplate-combined.html');

/**
 * Creates a new bucket document in MongoDB.
 * @param bucketName - The name of the bucket to create
 */
export async function createBucketStructure(bucketName: string): Promise<void> {
  log.enter('createBucketStructure()', log.brack);
  await Bucket.create({ name: bucketName });
  log.retrn('createBucketStructure()', log.kcarb);
}

/**
 * Parses a spreadsheet buffer and returns headers and row data.
 * First row is treated as headers.
 * @param fileBuffer - The spreadsheet file buffer
 */
export async function parseSpreadsheet(fileBuffer: Buffer): Promise<{ headers: string[], rows: any[] }> {
  log.enter('parseSpreadsheet()', log.brack);
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

  if (data.length < 2) {
    throw new Error('Spreadsheet must have at least a header row and one data row');
  }

  const headers = data[0] as string[];
  const rows = data.slice(1).map(row => {
    const obj: any = {};
    headers.forEach((header, index) => { obj[header] = row[index] || ''; });
    return obj;
  });

  log.retrn('parseSpreadsheet()', log.kcarb);
  return { headers, rows };
}

/**
 * Generates Org documents from spreadsheet rows and inserts them into MongoDB.
 * Replaces the old file-based generateHtmlFiles function.
 * @param bucketName - The bucket to assign the orgs to
 * @param rows - Spreadsheet row data
 * @param progressCallback - Called with progress percentage after each row
 */
export async function generateOrgDocuments(
  bucketName: string,
  rows: any[],
  progressCallback: (progress: number) => void
): Promise<void> {
  log.enter('generateOrgDocuments()', log.brack);

  const sanitizers: Record<string, (value: any) => string> = {
    organization_name:                   sanitizeName,
    organization_alternate_name:         sanitizeAlternateName,
    organization_website:                sanitizeWebsite,
    organization_email:                  sanitizeEmail,
    organization_description:            sanitizeDescription,
    organization_internal_notes:         sanitizeInternalNotes,
    organization_legal_status:           sanitizeOrganizationLegalStatus,
    organization_markdown_notes:         sanitizeMarkdownNotes,
    service_name:                        sanitizeName,
    service_alternate_name:              sanitizeAlternateName,
    service_email:                       sanitizeEmail,
    service_description:                 sanitizeDescription,
    service_short_description:           sanitizeServiceShortDescription,
    service_application_process:         sanitizeServiceApplicationProcess,
    service_required_documents:          sanitizeServiceRequiredDocuments,
    service_interpretation_services:     sanitizeServiceInterpretationServices,
    service_clinician_actions:           sanitizeServiceClinicianActions,
    service_cost:                        sanitizeServiceCost,
    service_wait_time:                   sanitizeServiceWaitTime,
    service_website:                     sanitizeWebsite,
    service_internal_notes:              sanitizeInternalNotes,
    service_markdown_notes:              sanitizeMarkdownNotes,
  };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    // Build org fields from spreadsheet row
    const name = sanitizeName(row[orgFieldMap.organization_name] || '');

    const address1  = sanitizeAddress(row[organizationLocationFieldMap.address] || '');
    const city      = sanitizeCity(row[organizationLocationFieldMap.city] || '');
    const state     = sanitizeState(row[organizationLocationFieldMap.state] || '');
    const zip       = sanitizeZip(row[organizationLocationFieldMap.zip] || '');
    const locName   = sanitizeLocationName(row[organizationLocationFieldMap.location_name] || '');

    const phoneNum  = sanitizeOrganizationPhones(row[organizationPhoneFieldMap.phone] || '');
    const phoneName = sanitizePhoneName(row[organizationPhoneFieldMap.phone_name] || '');

    const categories    = sanitizeServiceCategories(row[serviceFieldMap.service_top_categories] || '');
    const eligibilities = sanitizeServiceEligibilitiesList(row[serviceFieldMap.service_top_eligibilities] || '');

    const orgDoc: Partial<IOrg> = {
      name:      name || `New Service ${i + 1}`,
      bucket:    bucketName,
      status:    'incomplete',
      addresses: address1 ? [{ address_1: address1, city, state_province: state, postal_code: zip }] : [],
      phones:    phoneNum ? [{ number: phoneNum, service_type: phoneName }] : [],
      notes:     [],
      schedule:  { schedule_days: [] },
      services: [{
        name:                            sanitizeName(row[serviceFieldMap.service_name] || name),
        notes:                           [],
        schedule:                        { schedule_days: [] },
        shouldInheritScheduleFromParent: true,
        eligibilities,
        categories,
        addresses:                       [],
        phones:                          [],
      }],
      history: [{ action: 'created', by: 'unknown', at: new Date(), detail: `imported from spreadsheet` }],
    };

    await Org.create(orgDoc);

    progressCallback(Math.round(((i + 1) / rows.length) * 100));
  }

  log.retrn('generateOrgDocuments()', log.kcarb);
}

/**
 * Normalizes a SFSG categories or eligibilities array to plain strings.
 * SFSG returns objects like { name, id, top_level, featured } — we store only the name.
 * @param items - Array of strings or SFSG objects
 */
export function normalizeSFSGStringArray(items: any[]): string[] {
  return (items || []).map((item: any) => typeof item === 'string' ? item : item?.name).filter(Boolean);
}

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
    categories:                     (svc.categories || []).map(name => ({ name, id: null, top_level: false, featured: false })),
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

/**
 * Hydrates the combined HTML template with data from an Org document.
 * Returns the populated HTML string ready to be served to the iframe.
 * @param org - The Org document to hydrate the template with
 */
export async function hydrateTemplate(org: IOrg): Promise<string> {
  log.enter('hydrateTemplate()', log.brack);

  let html = await fs.readFile(TEMPLATE_PATH, 'utf-8');

  // Stamp org _id on body so frontend can reference it on save
  html = html.replace('<body', `<body data-org-id="${org._id}"`);

  // If org was imported from SFSG, set importedFileFromSFSG flag in template
  if (org.sfId) {
    html = html.replace('let importedFileFromSFSG = false;', 'let importedFileFromSFSG = true;');
  }

  // ── Org scalar fields ──────────────────────────────────────────────────────
  html = injectInput(html,    'organization_name',           org.name             || '');
  html = injectInput(html,    'organization_alternate_name', org.alternate_name   || '');
  html = injectInput(html,    'organization_website',        org.website          || '');
  html = injectInput(html,    'organization_email',          org.email            || '');
  html = injectInput(html,    'organization_legal_status',   org.legal_status     || '');
  html = injectTextarea(html, 'organization_description',    org.long_description || '');
  html = injectTextarea(html, 'organization_internal_notes', org.internal_note    || '');

  // ── Org markdown notes ─────────────────────────────────────────────────────
  if (org.notes?.length) {
    const notesHtml = org.notes.map(n => `<li>${n.note}</li>`).join('');
    html = html.replace(
      /(<ul[^>]*id="organization_markdown_notes"[^>]*>)([\s\S]*?)(<\/ul>)/,
      `$1${notesHtml}$3`
    );
  }

  // ── Org addresses ──────────────────────────────────────────────────────────
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

  // ── Org phones ─────────────────────────────────────────────────────────────
  if (org.phones?.length) {
    const phoneHtml = org.phones.map((p, i) =>
      `<li class="phone-row" data-number="${p.number}" data-type="${p.service_type || ''}"><span class="phone-row-num">${i + 1}.</span><span class="phone-row-name">${p.service_type || ''}</span><span class="phone-row-number">${p.number}</span><span class="phone-row-actions"><button type="button" class="edit-btn"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg> EDIT</button><button type="button" class="remove-btn"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg> REMOVE</button></span></li>`
    ).join('');
    html = html.replace(
      /<ul[^>]*id="organization_phones"[^>]*>\s*<\/ul>/,
      `<ul id="organization_phones" class="edit--section--list--item--sublist phone-row-list">${phoneHtml}</ul>`
    );
  }

  // ── Services ───────────────────────────────────────────────────────────────
  if (org.services?.length) {

    // Extract the service template block from the hidden serviceDivOrgTemplate
    const templateMatch = html.match(/<div[^>]*id="serviceDivOrganization"[\s\S]*?(?=<!---={10,}\s*EDIT SERVICES ENDS)/);
    const serviceTemplateHtml = templateMatch ? templateMatch[0] : null;

    if (serviceTemplateHtml) {
      const populatedServices = org.services.map((svc, i) => {
        let s = serviceTemplateHtml;

        // Give each service a unique id
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

        // Service phones
        if (svc.phones?.length) {
          const phoneHtml = svc.phones.map((p: any) =>
            `<li data-number="${p.number}" data-type="${p.service_type || ''}"><strong>${p.service_type || ''}</strong> ${p.number}</li>`
          ).join('');
          s = injectPhoneList(s, 'service_phones', phoneHtml);
        }

        // Service addresses
        if (svc.addresses?.length) {
          const locHtml = svc.addresses.map((a: any) =>
            `<li data-address1="${a.address_1 || ''}" data-city="${a.city || ''}" data-state="${a.state_province || ''}" data-zip="${a.postal_code || ''}">${a.address_1 || ''}, ${a.city || ''}, ${a.state_province || ''} ${a.postal_code || ''}</li>`
          ).join('');
          s = s.replace(
            /(<ul[^>]*id="service_locations"[^>]*>)([\s\S]*?)(<\/ul>)/,
            `$1${locHtml}$3`
          );
        }

        // Categories as pills
        if (svc.categories?.length) {
          const pillsHtml = svc.categories.map((c: any) =>
            `<div class="Select-value"><span class="Select-value-icon" aria-hidden="true">×</span><span class="Select-value-label">${c}</span></div>`
          ).join('');
          s = s.replace(
            /(<div[^>]*id="service_top_categories"[^>]*>)(\s*)(<div class="Select-placeholder">)/,
            `$1${pillsHtml}<div class="Select-placeholder" style="display:none;">`
          );
        }

        // Eligibilities as pills
        if (svc.eligibilities?.length) {
          const pillsHtml = svc.eligibilities.map((e: any) =>
            `<div class="Select-value"><span class="Select-value-icon" aria-hidden="true">×</span><span class="Select-value-label">${e}</span></div>`
          ).join('');
          s = s.replace(
            /(<div[^>]*id="service_top_eligibilities"[^>]*>)(\s*)(<div class="Select-placeholder">)/,
            `$1${pillsHtml}<div class="Select-placeholder" style="display:none;">`
          );
        }

        return s;
      }).join('\n');

      // Inject all populated services into orgServicesDiv
      html = html.replace(
        '<div class="edit--orgServices" id="orgServicesDiv"></div>',
        `<div class="edit--orgServices" id="orgServicesDiv">${populatedServices}</div>`
      );

      // Populate sidebar service links
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

// #endregion ------------------------------------------------------------------

console.leave();

// #region ====================== NOTES ========================================

// generateOrgDocuments() replaces generateHtmlFiles() — stores data in MongoDB instead of HTML files
// hydrateTemplate() replaces file reads — injects DB data into the combined template at request time
// parseSpreadsheet() is unchanged — still reads spreadsheet buffer into row objects
// createBucketStructure() now creates a Bucket document instead of filesystem directories

// #endregion ------------------------------------------------------------------

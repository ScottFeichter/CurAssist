// #region ===================== IMPORTS =======================================
import { extendedConsole as console } from '../../streams/consoles/customConsoles';
import { log } from '../../utils/logger/logger-setup/logger-wrapper';
import fs from 'fs/promises';
import path from 'path';
import * as XLSX from 'xlsx';
import { Bucket } from '../../database/models/bucket.model';
import { Org, IOrg, ISpreadsheetService } from '../../database/models/org.model';
import { orgFieldMap, serviceFieldMap, organizationLocationFieldMap, organizationPhoneFieldMap, serviceLocationFieldMap, servicePhoneFieldMap } from './buckets-map';
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
export async function parseSpreadsheet(fileBuffer: Buffer): Promise<{ headers: string[], rows: any[], workbook: XLSX.WorkBook }> {
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
  return { headers, rows, workbook };
}

/**
 * Generates Org documents from spreadsheet rows and inserts them into MongoDB.
 * Replaces the old file-based generateHtmlFiles function.
 * @param bucketName - The bucket to assign the orgs to
 * @param rows - Spreadsheet row data
 * @param progressCallback - Called with progress percentage after each row
 */
/** Result of a single row import attempt. */
export interface IRowResult {
  row: number;
  status: 'Success' | 'Failed';
  detail: string;
}

export async function generateOrgDocuments(
  bucketName: string,
  rows: any[],
  progressCallback: (progress: number) => void,
  createServiceFromOrg: boolean = false
): Promise<IRowResult[]> {
  log.enter('generateOrgDocuments()', log.brack);

  const results: IRowResult[] = [];

  // Reference map of field keys to sanitizer functions.
  // Not used in code — each sanitizer is called inline below.
  // Kept as a reference for which sanitizers apply to which fields.
  const _sanitizers: Record<string, (value: any) => string> = {
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
  void _sanitizers;

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

    // Org addresses and phones
    const orgAddresses: any[] = address1 ? [{ name: locName, address_1: address1, city, state_province: state, postal_code: zip }] : [];
    const orgPhones: any[]    = phoneNum ? [{ number: phoneNum, service_type: phoneName }] : [];

    // Build organization service from "Service X" prefixed headers
    const svcName = sanitizeName(row[serviceFieldMap.service_name] || '');
    const svcAddr = sanitizeAddress(row[serviceLocationFieldMap.address] || '');
    const svcCity = sanitizeCity(row[serviceLocationFieldMap.city] || '');
    const svcState = sanitizeState(row[serviceLocationFieldMap.state] || '');
    const svcZip  = sanitizeZip(row[serviceLocationFieldMap.zip] || '');
    const svcPhone = sanitizeOrganizationPhones(row[servicePhoneFieldMap.phone] || '');
    const svcPhoneName = sanitizePhoneName(row[servicePhoneFieldMap.phone_name] || '');
    const svcCategories    = sanitizeServiceCategories(row[serviceFieldMap.service_top_categories] || '');
    const svcEligibilities = sanitizeServiceEligibilitiesList(row[serviceFieldMap.service_top_eligibilities] || '');

    // Merge service address/phone into org arrays (SFSG stores them on the org)
    const svcLocName = sanitizeLocationName(row[serviceLocationFieldMap.location_name] || '');
    if (svcAddr) orgAddresses.push({ name: svcLocName, address_1: svcAddr, city: svcCity, state_province: svcState, postal_code: svcZip });
    if (svcPhone) orgPhones.push({ number: svcPhone, service_type: svcPhoneName });

    // Only create org.services[0] if any "Service X" columns have data
    const services: any[] = [];
    if (svcName) {
      services.push({
        name:                            svcName,
        alternate_name:                  sanitizeAlternateName(row[serviceFieldMap.service_alternate_name] || ''),
        email:                           sanitizeEmail(row[serviceFieldMap.service_email] || ''),
        url:                             sanitizeWebsite(row[serviceFieldMap.service_website] || ''),
        fee:                             sanitizeServiceCost(row[serviceFieldMap.service_cost] || ''),
        wait_time:                       sanitizeServiceWaitTime(row[serviceFieldMap.service_wait_time] || ''),
        application_process:             sanitizeServiceApplicationProcess(row[serviceFieldMap.service_application_process] || ''),
        required_documents:              sanitizeServiceRequiredDocuments(row[serviceFieldMap.service_required_documents] || ''),
        interpretation_services:         sanitizeServiceInterpretationServices(row[serviceFieldMap.service_interpretation_services] || ''),
        internal_note:                   sanitizeInternalNotes(row[serviceFieldMap.service_internal_notes] || ''),
        clinician_actions:               sanitizeServiceClinicianActions(row[serviceFieldMap.service_clinician_actions] || ''),
        notes:                           [],
        schedule:                        { schedule_days: [] },
        shouldInheritScheduleFromParent: true,
        eligibilities:                   svcEligibilities,
        categories:                      svcCategories,
        addresses:                       svcAddr ? [{ name: svcLocName, address_1: svcAddr, city: svcCity, state_province: svcState, postal_code: svcZip }] : [],
        phones:                          svcPhone ? [{ number: svcPhone, service_type: svcPhoneName }] : [],
      });
    }

    // spreadsheetService uses org-level headers including Top Categories / Top Eligibilities
    const ssCategories    = sanitizeServiceCategories(row[orgFieldMap.organization_top_categories] || '');
    const ssEligibilities = sanitizeServiceEligibilitiesList(row[orgFieldMap.organization_top_eligibilities] || '');

    // Build org-level service from org data when requested
    if (createServiceFromOrg && name) {
      services.push({
        name,
        alternate_name:                  sanitizeAlternateName(row[orgFieldMap.organization_alternate_name] || ''),
        email:                           sanitizeEmail(row[orgFieldMap.organization_email] || ''),
        url:                             sanitizeWebsite(row[orgFieldMap.organization_website] || ''),
        fee:                             '',
        wait_time:                       '',
        application_process:             '',
        required_documents:              '',
        interpretation_services:         '',
        internal_note:                   sanitizeInternalNotes(row[orgFieldMap.organization_internal_notes] || ''),
        clinician_actions:               '',
        notes:                           [],
        schedule:                        { schedule_days: [] },
        shouldInheritScheduleFromParent: true,
        eligibilities:                   ssEligibilities,
        categories:                      ssCategories,
        addresses:                       address1 ? [{ name: locName, address_1: address1, city, state_province: state, postal_code: zip }] : [],
        phones:                          phoneNum ? [{ number: phoneNum, service_type: phoneName }] : [],
      });
    }

    const orgDoc: Partial<IOrg> = {
      name:             name || `New Service ${i + 1}`,
      alternate_name:   sanitizeAlternateName(row[orgFieldMap.organization_alternate_name] || ''),
      website:          sanitizeWebsite(row[orgFieldMap.organization_website] || ''),
      email:            sanitizeEmail(row[orgFieldMap.organization_email] || ''),
      long_description: sanitizeDescription(row[orgFieldMap.organization_description] || ''),
      legal_status:     sanitizeOrganizationLegalStatus(row[orgFieldMap.organization_legal_status] || ''),
      internal_note:    sanitizeInternalNotes(row[orgFieldMap.organization_internal_notes] || ''),
      bucket:    bucketName,
      status:    'incomplete',
      addresses: orgAddresses,
      phones:    orgPhones,
      notes:     [],
      schedule:  { schedule_days: [] },
      services,
      spreadsheetService: {
        name:                            name,
        alternate_name:                  sanitizeAlternateName(row[orgFieldMap.organization_alternate_name] || ''),
        email:                           sanitizeEmail(row[orgFieldMap.organization_email] || ''),
        url:                             sanitizeWebsite(row[orgFieldMap.organization_website] || ''),
        long_description:                sanitizeDescription(row[orgFieldMap.organization_description] || ''),
        fee:                             '',
        wait_time:                       '',
        application_process:             '',
        required_documents:              '',
        interpretation_services:         '',
        internal_note:                   sanitizeInternalNotes(row[orgFieldMap.organization_internal_notes] || ''),
        clinician_actions:               '',
        notes:                           [],
        schedule:                        { schedule_days: [] },
        shouldInheritScheduleFromParent: true,
        eligibilities:                   ssEligibilities,
        categories:                      ssCategories,
        addresses:                       address1 ? [{ name: locName, address_1: address1, city, state_province: state, postal_code: zip }] : [],
        phones:                          phoneNum ? [{ number: phoneNum, service_type: phoneName }] : [],
      } as ISpreadsheetService,
      history: [{ action: 'created', by: 'unknown', at: new Date(), detail: `imported from spreadsheet` }],
    };

    try {
      await Org.create(orgDoc);
      results.push({ row: i, status: 'Success', detail: '' });
    } catch (err: any) {
      results.push({ row: i, status: 'Failed', detail: err.message || String(err) });
    }

    progressCallback(Math.round(((i + 1) / rows.length) * 100));
  }

  log.retrn('generateOrgDocuments()', log.kcarb);
  return results;
}

/**
 * Appends import status columns to the original workbook and returns an xlsx buffer.
 * @param workbook - The original parsed workbook
 * @param results - Per-row import results
 * @param bucketName - The bucket name used for the import
 */
export function buildReportBuffer(workbook: XLSX.WorkBook, results: IRowResult[], bucketName: string): Buffer {
  log.enter('buildReportBuffer()', log.brack);

  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
  const headers = data[0] as string[];
  const timestamp = new Date().toISOString().replace('T', ' ').replace(/\.\d+Z$/, '');

  headers.push('Import Status', 'Import Detail', 'Bucket Name', 'Import Date');

  for (let i = 0; i < results.length; i++) {
    const dataRow = data[i + 1] || [];
    dataRow.push(results[i].status, results[i].detail, bucketName, timestamp);
    data[i + 1] = dataRow;
  }

  const newSheet = XLSX.utils.aoa_to_sheet(data);
  workbook.Sheets[workbook.SheetNames[0]] = newSheet;

  const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  log.retrn('buildReportBuffer()', log.kcarb);
  return buf;
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

  // importedFileFromSFSG = true only when org has sfsg_id AND no spreadsheetService
  // (SFSG imports lock both toggles; spreadsheet imports enable the service toggle)
  if (org.sfsg_id && !org.spreadsheetService) {
    html = html.replace('let importedFileFromSFSG = false;', 'let importedFileFromSFSG = true;');
  }
  if (org.sfsg_id) {
    html = html.replace('value="TBD" placeholder="\u2014"', `value="${org.sfsg_id}" placeholder="\u2014"`);
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

  // ── Spreadsheet Service ────────────────────────────────────────────────────
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
      const phoneHtml = svc.phones.map((p: any) =>
        `<li data-number="${p.number}" data-type="${p.service_type || ''}"><strong>${p.service_type || ''}</strong> ${p.number}</li>`
      ).join('');
      html = injectPhoneList(html, 'service_phones', phoneHtml);
    }

    if (svc.addresses?.length) {
      const locHtml = svc.addresses.map((a: any) =>
        `<div>${a.address_1 || ''}, ${a.city || ''}, ${a.state_province || ''} ${a.postal_code || ''}</div>`
      ).join('');
      html = injectLocationDiv(html, 'service_locations', locHtml);
    }

    if (svc.categories?.length) {
      const pillsHtml = svc.categories.map((c: any) =>
        `<div class="Select-value"><span class="Select-value-icon" aria-hidden="true">×</span><span class="Select-value-label">${c}</span></div>`
      ).join('');
      html = html.replace(
        /(<div[^>]*id="service_top_categories"[^>]*>)(\s*)(<div class="Select-placeholder">)/,
        `$1${pillsHtml}<div class="Select-placeholder" style="display:none;">`
      );
    }

    if (svc.eligibilities?.length) {
      const pillsHtml = svc.eligibilities.map((e: any) =>
        `<div class="Select-value"><span class="Select-value-icon" aria-hidden="true">×</span><span class="Select-value-label">${e}</span></div>`
      ).join('');
      html = html.replace(
        /(<div[^>]*id="service_top_eligibilities"[^>]*>)(\s*)(<div class="Select-placeholder">)/,
        `$1${pillsHtml}<div class="Select-placeholder" style="display:none;">`
      );
    }

    if (svc.service_belongs_to_org) {
      html = injectInput(html, 'serviceBelongsToOrg', svc.service_belongs_to_org);
    }
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
// parseSpreadsheet() reads spreadsheet buffer into row objects and returns the workbook for report generation
// createBucketStructure() now creates a Bucket document instead of filesystem directories
// buildReportBuffer() appends import status columns to the original workbook and returns xlsx buffer

// #endregion ------------------------------------------------------------------

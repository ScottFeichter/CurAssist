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
      }],
      history: [{ action: 'created', by: 'unknown', at: new Date(), detail: `imported from spreadsheet` }],
    };

    await Org.create(orgDoc);

    progressCallback(Math.round(((i + 1) / rows.length) * 100));
  }

  log.retrn('generateOrgDocuments()', log.kcarb);
}

/**
 * Hydrates the combined HTML template with data from an Org document.
 * Returns the populated HTML string ready to be served to the iframe.
 * @param org - The Org document to hydrate the template with
 */
export async function hydrateTemplate(org: IOrg): Promise<string> {
  log.enter('hydrateTemplate()', log.brack);

  let html = await fs.readFile(TEMPLATE_PATH, 'utf-8');

  // Inject org _id so the frontend can reference it on save
  html = html.replace('<body', `<body data-org-id="${org._id}"`);

  // Basic org fields
  html = injectInput(html, 'organization_name', org.name || '');
  html = injectInput(html, 'organization_alternate_name', '');
  html = injectInput(html, 'organization_website', '');
  html = injectInput(html, 'organization_email', '');

  // Notes
  const orgNote = org.notes?.[0]?.note || '';
  html = injectTextarea(html, 'organization_description', orgNote);

  // Address
  if (org.addresses?.length) {
    const a = org.addresses[0];
    const locLabel = a.address_1 ? `<strong>${a.address_1}</strong>` : '';
    const locHtml = `<div>${locLabel}${locLabel ? '<br>' : ''}${a.address_1 || ''}<br>${a.city || ''}, ${a.state_province || ''} ${a.postal_code || ''}</div>`;
    html = injectLocationDiv(html, 'organization_locations', locHtml);
  }

  // Phones
  if (org.phones?.length) {
    const p = org.phones[0];
    const phoneHtml = `<li><strong>${p.service_type || ''}</strong> ${p.number}</li>`;
    html = injectPhoneList(html, 'organization_phones', phoneHtml);
  }

  // Services
  if (org.services?.length) {
    const svc = org.services[0];
    html = injectInput(html, 'service_name', svc.name || '');
    html = injectInput(html, 'service_cost', '');
    html = injectInput(html, 'service_wait_time', '');
    html = injectInput(html, 'service_website', '');
    html = injectInput(html, 'service_email', '');
    const svcNote = svc.notes?.[0]?.note || '';
    html = injectTextarea(html, 'service_description', svcNote);
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

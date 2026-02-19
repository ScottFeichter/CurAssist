// #region ===================== IMPORTS =======================================
import { extendedConsole as console } from '../../streams/consoles/customConsoles';
import { log } from '../../utils/logger/logger-setup/logger-wrapper';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as XLSX from 'xlsx';
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
  sanitizeHours,
  sanitizeMarkdownNotes,
  sanitizeOrganizationLegalStatus,
  sanitizeServiceShortDescription,
  sanitizeServiceApplicationProcess,
  sanitizeServiceRequiredDocuments,
  sanitizeServiceInterpretationServices,
  sanitizeServiceClinicianActions,
  sanitizeServiceEligibilities,
  sanitizeServiceCost,
  sanitizeServiceWaitTime,
  sanitizeServiceCategories
} from './bucket-sanitizers';
// #endregion ------------------------------------------------------------------

console.enter();

// #region ===================== HELPERS =======================================

const execAsync = promisify(exec);

const BUCKETS_PATH = path.join(process.cwd(), 'content', 'Buckets');

/**
 * Creates bucket directory structure:
 * - content/Buckets/[bucketName]/
 * - content/Buckets/[bucketName]/complete/
 * - content/Buckets/[bucketName]/incomplete/
 * - content/Buckets/[bucketName]/pending/
 */
export async function createBucketStructure(bucketName: string): Promise<void> {
  log.enter("createBucketStructure()", log.brack);
  const bucketPath = path.join(BUCKETS_PATH, bucketName);
  
  await fs.mkdir(bucketPath, { recursive: true });
  await fs.mkdir(path.join(bucketPath, 'complete'), { recursive: true });
  await fs.mkdir(path.join(bucketPath, 'incomplete'), { recursive: true });
  await fs.mkdir(path.join(bucketPath, 'pending'), { recursive: true });
  log.retrn("createBucketStructure()", log.kcarb);
}

/**
 * Parses spreadsheet file and returns array of row data
 * First row is treated as headers
 */
export async function parseSpreadsheet(fileBuffer: Buffer): Promise<{ headers: string[], rows: any[] }> {
  log.enter("parseSpreadsheet()", log.brack);
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
    headers.forEach((header, index) => {
      obj[header] = row[index] || '';
    });
    return obj;
  });
  
  log.retrn("parseSpreadsheet()", log.kcarb);
  return { headers, rows };
}

/**
 * Generates HTML files from template using spreadsheet data
 * Saves files to incomplete folder with progress updates
 */
export async function generateHtmlFiles(
  templatePath: string,
  bucketName: string,
  data: any[],
  progressCallback: (progress: number) => void
): Promise<void> {
  log.enter("generateHtmlFiles()", log.brack);
  const incompletePath = path.join(BUCKETS_PATH, bucketName, 'incomplete');
  const buildScriptPath = path.join(process.cwd(), 'content', 'Templates', 'build-template.js');
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    
    // Generate filename from name field or first column
    const nameValue = row['name'] || row['Name'] || Object.values(row)[0] as string;
    const sanitizedName = sanitizeName(nameValue || '');
    const filename = sanitizedName
      ? `${sanitizedName.replace(/[^a-z0-9]/gi, '_')}_${i}.html`
      : `file_${i}.html`;
    
    // Run build-template.js to generate the HTML file
    await execAsync(`node "${buildScriptPath}" "${filename}" "${incompletePath}"`);
    
    // Read the generated file and populate with data
    const filePath = path.join(incompletePath, filename);
    let html = await fs.readFile(filePath, 'utf-8');
    
    // Populate both organization and service sections with same spreadsheet data
    const allFieldMaps = { ...orgFieldMap, ...serviceFieldMap };
    
    // Map of field IDs to their sanitizer functions
    const sanitizers: Record<string, (value: any) => string> = {
      organization_internal_notes: sanitizeInternalNotes,
      organization_name: sanitizeName,
      organization_alternate_name: sanitizeAlternateName,
      organization_website: sanitizeWebsite,
      organization_email: sanitizeEmail,
      organization_description: sanitizeDescription,
      organization_legal_status: sanitizeOrganizationLegalStatus,
      organization_markdown_notes: sanitizeMarkdownNotes,
      service_internal_notes: sanitizeInternalNotes,
      service_name: sanitizeName,
      service_alternate_name: sanitizeAlternateName,
      service_email: sanitizeEmail,
      service_description: sanitizeDescription,
      service_short_description: sanitizeServiceShortDescription,
      service_application_process: sanitizeServiceApplicationProcess,
      service_required_documents: sanitizeServiceRequiredDocuments,
      service_interpretation_services: sanitizeServiceInterpretationServices,
      service_clinician_actions: sanitizeServiceClinicianActions,
      service_eligibilities: sanitizeServiceEligibilities,
      service_cost: sanitizeServiceCost,
      service_wait_time: sanitizeServiceWaitTime,
      service_website: sanitizeWebsite,
      service_markdown_notes: sanitizeMarkdownNotes,
      service_categories: sanitizeServiceCategories
    };
    
    for (const [htmlId, spreadsheetColumn] of Object.entries(allFieldMaps)) {
      const rawValue = row[spreadsheetColumn] || '';
      const value = sanitizers[htmlId] ? sanitizers[htmlId](rawValue) : rawValue;
      
      // Match input elements by id
      const inputRegex = new RegExp(`(<input[^>]*id="${htmlId}"[^>]*value=")[^"]*(")`, 'gi');
      html = html.replace(inputRegex, `$1${value}$2`);
      
      // Match textarea elements by id
      const textareaRegex = new RegExp(`(<textarea[^>]*id="${htmlId}"[^>]*>)[\\s\\S]*?(<\\/textarea>)`, 'gi');
      html = html.replace(textareaRegex, `$1${value}$2`);
    }
    
    // Handle organization location data - combine address fields into location list
    const orgLocationName = sanitizeLocationName(row[organizationLocationFieldMap.location_name] || '');
    const orgAddress = sanitizeAddress(row[organizationLocationFieldMap.address] || '');
    const orgCity = sanitizeCity(row[organizationLocationFieldMap.city] || '');
    const orgState = sanitizeState(row[organizationLocationFieldMap.state] || '');
    const orgZip = sanitizeZip(row[organizationLocationFieldMap.zip] || '');
    
    if (orgAddress || orgCity || orgState || orgZip) {
      const locationLabel = orgLocationName ? `<strong style="font-weight: bold;">${orgLocationName}</strong>` : '';
      const locationHtml = `<div>${locationLabel}${locationLabel ? '<br>' : ''}${orgAddress}${orgAddress ? '<br>' : ''}${orgCity}, ${orgState} ${orgZip}</div>`;
      html = html.replace(
        /(<div[^>]*id="organization_locations"[^>]*>)([\s\S]*?)(<\/div>)/,
        `$1${locationHtml}$3`
      );
    }
    
    // Handle service location data - use same data as organization
    if (orgAddress || orgCity || orgState || orgZip) {
      const locationLabel = orgLocationName ? `<strong style="font-weight: bold;">${orgLocationName}</strong>` : '';
      const locationHtml = `<div>${locationLabel}${locationLabel ? '<br>' : ''}${orgAddress}${orgAddress ? '<br>' : ''}${orgCity}, ${orgState} ${orgZip}</div>`;
      html = html.replace(
        /(<div[^>]*id="service_locations"[^>]*>)([\s\S]*?)(<\/div>)/,
        `$1${locationHtml}$3`
      );
    }
    
    // Handle organization phone data - combine phone fields into phone list
    const orgPhoneName = sanitizePhoneName(row[organizationPhoneFieldMap.phone_name] || '');
    const orgPhone = sanitizeOrganizationPhones(row[organizationPhoneFieldMap.phone] || '');
    
    if (orgPhoneName || orgPhone) {
      const phoneHtml = `<li><strong>${orgPhoneName}</strong> ${orgPhone}</li>`;
      html = html.replace(
        /(<ul[^>]*id="organization_phones"[^>]*>)([\s\S]*?)(<\/ul>)/,
        `$1${phoneHtml}$3`
      );
    }
    
    // Write the populated HTML back to the file
    await fs.writeFile(filePath, html, 'utf-8');
    
    // Update progress
    const progress = Math.round(((i + 1) / data.length) * 100);
    progressCallback(progress);
  }
  log.retrn("generateHtmlFiles()", log.kcarb);
}

// #endregion ------------------------------------------------------------------

console.leave();

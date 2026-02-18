// #region ===================== IMPORTS =======================================
import { extendedConsole as console } from '../../streams/consoles/customConsoles';
import { log } from '../../utils/logger/logger-setup/logger-wrapper';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as XLSX from 'xlsx';
import { orgFieldMap, serviceFieldMap, organizationLocationFieldMap, organizationPhoneFieldMap } from './buckets-map';
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
    const filename = nameValue 
      ? `${nameValue.replace(/[^a-z0-9]/gi, '_')}_${i}.html`
      : `file_${i}.html`;
    
    // Run build-template.js to generate the HTML file
    await execAsync(`node "${buildScriptPath}" "${filename}" "${incompletePath}"`);
    
    // Read the generated file and populate with data
    const filePath = path.join(incompletePath, filename);
    let html = await fs.readFile(filePath, 'utf-8');
    
    // Populate both organization and service sections with same spreadsheet data
    const allFieldMaps = { ...orgFieldMap, ...serviceFieldMap };
    
    for (const [htmlId, spreadsheetColumn] of Object.entries(allFieldMaps)) {
      const value = row[spreadsheetColumn] || '';
      
      // Match input elements by id
      const inputRegex = new RegExp(`(<input[^>]*id="${htmlId}"[^>]*value=")[^"]*(")`, 'gi');
      html = html.replace(inputRegex, `$1${value}$2`);
      
      // Match textarea elements by id
      const textareaRegex = new RegExp(`(<textarea[^>]*id="${htmlId}"[^>]*>)[\\s\\S]*?(<\\/textarea>)`, 'gi');
      html = html.replace(textareaRegex, `$1${value}$2`);
    }
    
    // Handle organization location data - combine address fields into location list
    const orgLocationName = row[organizationLocationFieldMap.location_name] || '';
    const orgAddress = row[organizationLocationFieldMap.address] || '';
    const orgCity = row[organizationLocationFieldMap.city] || '';
    const orgState = row[organizationLocationFieldMap.state] || '';
    const orgZip = row[organizationLocationFieldMap.zip] || '';
    
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
    const orgPhoneName = row[organizationPhoneFieldMap.phone_name] || '';
    const orgPhone = row[organizationPhoneFieldMap.phone] || '';
    
    if (orgPhoneName || orgPhone) {
      const phoneHtml = `<li><strong>${orgPhoneName}:</strong> ${orgPhone}</li>`;
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

import fs from 'fs/promises';
import path from 'path';
import * as XLSX from 'xlsx';
import { orgFieldMap, serviceFieldMap } from './buckets-map';

const BUCKETS_PATH = path.join(process.cwd(), 'content', 'Buckets');

/**
 * Creates bucket directory structure:
 * - content/Buckets/[bucketName]/
 * - content/Buckets/[bucketName]/complete/
 * - content/Buckets/[bucketName]/incomplete/
 * - content/Buckets/[bucketName]/pending/
 */
export async function createBucketStructure(bucketName: string): Promise<void> {
  const bucketPath = path.join(BUCKETS_PATH, bucketName);
  
  await fs.mkdir(bucketPath, { recursive: true });
  await fs.mkdir(path.join(bucketPath, 'complete'), { recursive: true });
  await fs.mkdir(path.join(bucketPath, 'incomplete'), { recursive: true });
  await fs.mkdir(path.join(bucketPath, 'pending'), { recursive: true });
}

/**
 * Parses spreadsheet file and returns array of row data
 * First row is treated as headers
 */
export async function parseSpreadsheet(fileBuffer: Buffer): Promise<{ headers: string[], rows: any[] }> {
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
  const template = await fs.readFile(templatePath, 'utf-8');
  const incompletePath = path.join(BUCKETS_PATH, bucketName, 'incomplete');
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    let html = template;
    
    // Populate organization section (using data-field attributes)
    for (const [htmlField, spreadsheetColumn] of Object.entries(orgFieldMap)) {
      const value = row[spreadsheetColumn] || '';
      const regex = new RegExp(`(<input[^>]*data-field="${htmlField}"[^>]*value=")[^"]*(")`, 'gi');
      html = html.replace(regex, `$1${value}$2`);
    }
    
    // Populate service section (using placeholder text)
    for (const [placeholder, spreadsheetColumn] of Object.entries(serviceFieldMap)) {
      const value = row[spreadsheetColumn] || '';
      const escapedPlaceholder = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(<input[^>]*placeholder="${escapedPlaceholder}"[^>]*value=")[^"]*(")`, 'gi');
      html = html.replace(regex, `$1${value}$2`);
    }
    
    // Generate filename from first column or use index
    const firstValue = Object.values(row)[0] as string;
    const filename = firstValue 
      ? `${firstValue.replace(/[^a-z0-9]/gi, '_')}_${i}.html`
      : `file_${i}.html`;
    
    await fs.writeFile(path.join(incompletePath, filename), html, 'utf-8');
    
    // Update progress
    const progress = Math.round(((i + 1) / data.length) * 100);
    progressCallback(progress);
  }
}

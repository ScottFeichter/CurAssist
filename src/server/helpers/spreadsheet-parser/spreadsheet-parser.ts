import { extendedConsole as console } from '../../../streams/consoles/customConsoles';
import { log } from '../../../utils/logger/logger-setup/logger-wrapper';
import * as XLSX from 'xlsx';
import { Bucket } from '../../../database/models/bucket.model';

console.enter();

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

console.leave();

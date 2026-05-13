import { extendedConsole as console } from '../../../streams/consoles/customConsoles';
import { log } from '../../../utils/logger/logger-setup/logger-wrapper';
import * as XLSX from 'xlsx';

console.enter();

/** Result of a single row import attempt. */
export interface IRowResult {
  row: number;
  status: 'Success' | 'Failed';
  detail: string;
}

/** Result of a single SFSG submission attempt. */
export interface ISfsgResult {
  row: number;
  status: 'Success' | 'Failed' | 'Skipped';
  detail: string;
  sfsgId?: number;
}

/**
 * Appends import status columns to the original workbook and returns an xlsx buffer.
 * @param workbook - The original parsed workbook
 * @param results - Per-row DB creation results
 * @param bucketName - The bucket name used for the import
 * @param sfsgResults - Optional per-row SFSG submission results (direct submit only)
 */
export function buildReportBuffer(workbook: XLSX.WorkBook, results: IRowResult[], bucketName: string, sfsgResults?: ISfsgResult[]): Buffer {
  log.enter('buildReportBuffer()', log.brack);

  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
  const headers = data[0] as string[];
  const timestamp = new Date().toISOString().replace('T', ' ').replace(/\.\d+Z$/, '');

  headers.push('DB Status', 'DB Detail');
  if (sfsgResults) headers.push('SFSG Status', 'SFSG Detail', 'SFSG Org ID');
  headers.push('Bucket Name', 'Import Date');

  for (let i = 0; i < results.length; i++) {
    const dataRow = data[i + 1] || [];
    dataRow.push(results[i].status, results[i].detail);
    if (sfsgResults) {
      const sfsg = sfsgResults[i] || { status: 'Skipped', detail: 'No SFSG result', sfsgId: '' };
      dataRow.push(sfsg.status, sfsg.detail, sfsg.sfsgId || '');
    }
    dataRow.push(bucketName, timestamp);
    data[i + 1] = dataRow;
  }

  const newSheet = XLSX.utils.aoa_to_sheet(data);
  workbook.Sheets[workbook.SheetNames[0]] = newSheet;

  const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  log.retrn('buildReportBuffer()', log.kcarb);
  return buf;
}

console.leave();

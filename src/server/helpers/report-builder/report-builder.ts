import { extendedConsole as console } from '../../../streams/consoles/customConsoles';
import { log } from '../../../utils/logger/logger-setup/logger-wrapper';
import ExcelJS from 'exceljs';

console.enter();

// #region ===================== INTERFACES ====================================

/** Per-field result for a single field in a row. */
export interface IFieldResult {
  status: 'success' | 'failure' | 'n/a';
  value: string;
}

/** Result of a single row import attempt. */
export interface IRowResult {
  row: number;
  status: 'Success' | 'Failed';
  detail: string;
  orgId?: string;
  fields: Record<string, IFieldResult>;
}

/** Result of a single SFSG submission attempt. */
export interface ISfsgResult {
  row: number;
  status: 'Success' | 'Failed' | 'Skipped';
  detail: string;
  sfsgId?: number;
  fields?: Record<string, IFieldResult>;
}

// #endregion ------------------------------------------------------------------

// #region ===================== CONSTANTS =====================================

const HEADER_LABELS: string[] = [
  'Name',
  'Org ID',
  'CurAssist Ingest',
  'SFSG Submit',
  'Nickname',
  'Website',
  'Email',
  'Description',
  'Legal Status',
  'Internal Notes',
  'Location Name',
  'Address',
  'City',
  'State',
  'Zip',
  'Phone Name',
  'Phone',
  'Service Name',
  'Service Description',
  'Service Short Description',
  'Service Application Process',
  'Service Required Documents',
  'Service Interpretation Services',
  'Service Clinician Actions',
  'Service Cost',
  'Service Wait Time',
  'Service Internal Notes',
  'Service Location Name',
  'Service Address',
  'Service City',
  'Service State',
  'Service Zip',
  'Service Phone',
  'Service Phone Name',
  'Service Eligibilities',
  'Service Categories',
];

/** Field keys matching column order. */
const FIELD_COLUMNS: string[] = [
  'name',
  'orgId',
  'curAssistIngest',
  'sfsgSubmit',
  'nickname',
  'website',
  'email',
  'description',
  'legalStatus',
  'internalNotes',
  'locationName',
  'address',
  'city',
  'state',
  'zip',
  'phoneName',
  'phone',
  'serviceName',
  'serviceDescription',
  'serviceShortDescription',
  'serviceApplicationProcess',
  'serviceRequiredDocuments',
  'serviceInterpretationServices',
  'serviceClinicianActions',
  'serviceCost',
  'serviceWaitTime',
  'serviceInternalNotes',
  'serviceLocationName',
  'serviceAddress',
  'serviceCity',
  'serviceState',
  'serviceZip',
  'servicePhone',
  'servicePhoneName',
  'serviceEligibilities',
  'serviceCategories',
];

const COLOR_GREEN = { argb: 'FF006400' };
const COLOR_RED = { argb: 'FFFF0000' };
const COLOR_BLUE = { argb: 'FF4472C4' };
const COLOR_WHITE = { argb: 'FFFFFFFF' };

const HEADER_FILL: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
const HEADER_FONT: Partial<ExcelJS.Font> = { bold: true, color: COLOR_WHITE, size: 11 };
const TITLE_FONT: Partial<ExcelJS.Font> = { bold: true, size: 14 };
const LABEL_FONT: Partial<ExcelJS.Font> = { bold: true, size: 11 };
const ROW_FILL_WHITE: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
const ROW_FILL_GREY: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };

// #endregion ------------------------------------------------------------------

// #region ===================== BUILDER =======================================

/**
 * Builds the ingestion/submission report from scratch.
 * @param results - Per-row CurAssist ingest results with field-level detail
 * @param bucketName - The bucket name
 * @param sfsgResults - Optional per-row SFSG submission results
 */
export async function buildReportBuffer(results: IRowResult[], bucketName: string, sfsgResults?: ISfsgResult[]): Promise<Buffer> {
  log.enter('buildReportBuffer()', log.brack);

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Report');

  const timestamp = new Date().toISOString().replace('T', ' ').replace(/\.\d+Z$/, '');

  // ── Row 1: Title (merged A1:D1) ────────────────────────────────────────────
  ws.mergeCells('A1:D1');
  const titleCell = ws.getCell('A1');
  titleCell.value = 'Ingestion/Submission Report';
  titleCell.font = TITLE_FONT;

  // ── Row 2: Date ────────────────────────────────────────────────────────────
  ws.getCell('A2').value = 'Date:';
  ws.getCell('A2').font = LABEL_FONT;
  ws.getCell('B2').value = timestamp;

  // ── Row 3: Bucket ──────────────────────────────────────────────────────────
  ws.getCell('A3').value = 'Bucket:';
  ws.getCell('A3').font = LABEL_FONT;
  ws.getCell('B3').value = bucketName;

  // ── Row 4: Empty spacer ────────────────────────────────────────────────────

  // ── Row 5: Headers ─────────────────────────────────────────────────────────
  const headerRow = ws.getRow(5);
  for (let col = 0; col < HEADER_LABELS.length; col++) {
    const cell = headerRow.getCell(col + 1);
    cell.value = HEADER_LABELS[col];
    cell.font = HEADER_FONT;
    cell.fill = HEADER_FILL;
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  }
  headerRow.commit();

  // ── Freeze panes: right of col D, below row 5 ─────────────────────────────
  ws.views = [{ state: 'frozen' as const, xSplit: 4, ySplit: 5, topLeftCell: 'E6', activeCell: 'E6' }];

  // ── Sort results: failures first, then n/a, then success ──────────────────
  const statusOrder = (result: IRowResult, sfsg?: ISfsgResult): number => {
    const ingestOrder = result.status === 'Failed' ? 0 : 1;
    let sfsgOrder = 1; // n/a
    if (sfsg) {
      if (sfsg.status === 'Failed') sfsgOrder = 0;
      else if (sfsg.status === 'Success') sfsgOrder = 2;
    }
    return ingestOrder * 10 + sfsgOrder;
  };

  const sortedIndices = results.map((_, i) => i).sort((a, b) => {
    return statusOrder(results[a], sfsgResults?.[a]) - statusOrder(results[b], sfsgResults?.[b]);
  });

  // ── Data rows (starting at row 6) ─────────────────────────────────────────
  const DATA_START_ROW = 6;

  for (let i = 0; i < sortedIndices.length; i++) {
    const idx = sortedIndices[i];
    const result = results[idx];
    const sfsg = sfsgResults?.[idx];
    const rowIdx = DATA_START_ROW + i;
    const row = ws.getRow(rowIdx);

    for (let col = 0; col < FIELD_COLUMNS.length; col++) {
      const fieldKey = FIELD_COLUMNS[col];
      const cell = row.getCell(col + 1);
      let cellValue = '';
      let color = COLOR_GREEN;

      if (fieldKey === 'name') {
        cellValue = result.fields.name?.value || `Row ${result.row + 1}`;
        if (result.fields.name?.status === 'n/a') {
          cellValue = 'n/a';
          color = COLOR_BLUE;
        } else if (result.fields.name?.status === 'failure') {
          color = COLOR_RED;
        } else {
          color = COLOR_GREEN;
        }
      } else if (fieldKey === 'orgId') {
        if (sfsg && sfsg.status === 'Success' && sfsg.sfsgId) {
          cellValue = String(sfsg.sfsgId);
          color = COLOR_GREEN;
        } else {
          cellValue = 'n/a';
          color = COLOR_BLUE;
        }
      } else if (fieldKey === 'curAssistIngest') {
        if (result.status === 'Success') {
          cellValue = 'success';
          color = COLOR_GREEN;
        } else {
          cellValue = 'failure';
          color = COLOR_RED;
        }
      } else if (fieldKey === 'sfsgSubmit') {
        if (!sfsg) {
          cellValue = 'n/a';
          color = COLOR_BLUE;
        } else if (sfsg.status === 'Success') {
          cellValue = 'success';
          color = COLOR_GREEN;
        } else if (sfsg.status === 'Skipped') {
          cellValue = 'n/a';
          color = COLOR_BLUE;
        } else {
          cellValue = sfsg.detail ? `failure: ${sfsg.detail}` : 'failure';
          color = COLOR_RED;
        }
      } else {
        const fieldResult = result.fields[fieldKey];
        if (!fieldResult || fieldResult.status === 'n/a') {
          cellValue = 'n/a';
          color = COLOR_BLUE;
        } else if (fieldResult.status === 'success') {
          cellValue = fieldResult.value;
          color = COLOR_GREEN;
        } else {
          cellValue = fieldResult.value;
          color = COLOR_RED;
        }
      }

      cell.value = cellValue;
      cell.font = { color };
      cell.fill = i % 2 === 0 ? ROW_FILL_WHITE : ROW_FILL_GREY;
    }

    row.commit();
  }

  // ── Column widths ──────────────────────────────────────────────────────────
  ws.getColumn(1).width = 25;  // Name
  ws.getColumn(2).width = 10;  // Org ID
  ws.getColumn(3).width = 16;  // CurAssist Ingest
  ws.getColumn(4).width = 14;  // SFSG Submit
  for (let col = 5; col <= FIELD_COLUMNS.length; col++) {
    ws.getColumn(col).width = 20;
  }

  const buffer = await wb.xlsx.writeBuffer();
  log.retrn('buildReportBuffer()', log.kcarb);
  return Buffer.from(buffer);
}

// #endregion ------------------------------------------------------------------

console.leave();

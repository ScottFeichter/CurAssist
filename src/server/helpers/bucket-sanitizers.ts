// #region ===================== IMPORTS =======================================
import { extendedConsole as console } from '../../streams/consoles/customConsoles';
import { log } from '../../utils/logger/logger-setup/logger-wrapper';
// #endregion ------------------------------------------------------------------

console.enter();

// #region ===================== SANITIZERS ====================================

export function sanitizeSpreadsheetData(rows: any[]): any[] {
  log.enter("sanitizeSpreadsheetData()", log.brack);
  const result = rows.map(row => {
    const sanitized: any = {};

    for (const [key, value] of Object.entries(row)) {
      sanitized[key] = sanitizeValue(value);
    }

    return sanitized;
  });
  log.retrn("sanitizeSpreadsheetData()", log.kcarb);
  return result;
}

function sanitizeValue(value: any): string {
  log.enter("sanitizeValue()", log.brack);
  if (value === null || value === undefined) {
    log.retrn("sanitizeValue()", log.kcarb);
    return '';
  }

  log.retrn("sanitizeValue()", log.kcarb);
  return String(value).trim();
}

// ============================================================================
// SHARED FIELD SANITIZERS (used by both organization and service)
// ============================================================================

export function sanitizeInternalNotes(value: any): string {
  log.enter("sanitizeInternalNotes()", log.brack);
  log.retrn("sanitizeInternalNotes()", log.kcarb);
  return sanitizeValue(value);
}

export function sanitizeName(value: any): string {
  log.enter("sanitizeName()", log.brack);
  const cleaned = sanitizeValue(value);
  const sentenceCase = cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase() : '';
  log.retrn("sanitizeName()", log.kcarb);
  return sentenceCase;
}

export function sanitizeAlternateName(value: any): string {
  log.enter("sanitizeAlternateName()", log.brack);
  log.retrn("sanitizeAlternateName()", log.kcarb);
  return sanitizeValue(value);
}

export function sanitizeWebsite(value: any): string {
  log.enter("sanitizeWebsite()", log.brack);
  log.retrn("sanitizeWebsite()", log.kcarb);
  return sanitizeValue(value);
}

export function sanitizeEmail(value: any): string {
  log.enter("sanitizeEmail()", log.brack);
  log.retrn("sanitizeEmail()", log.kcarb);
  return sanitizeValue(value);
}

export function sanitizeDescription(value: any): string {
  log.enter("sanitizeDescription()", log.brack);
  log.retrn("sanitizeDescription()", log.kcarb);
  return sanitizeValue(value);
}

export function sanitizeHours(value: any): string {
  log.enter("sanitizeHours()", log.brack);
  log.retrn("sanitizeHours()", log.kcarb);
  return sanitizeValue(value);
}

export function sanitizeMarkdownNotes(value: any): string {
  log.enter("sanitizeMarkdownNotes()", log.brack);
  log.retrn("sanitizeMarkdownNotes()", log.kcarb);
  return sanitizeValue(value);
}

export function sanitizeLocations(value: any): string {
  log.enter("sanitizeLocations()", log.brack);
  log.retrn("sanitizeLocations()", log.kcarb);
  return sanitizeValue(value);
}

// ============================================================================
// LOCATION FIELD MAP SANITIZERS (shared)
// ============================================================================

export function sanitizeLocationName(value: any): string {
  log.enter("sanitizeLocationName()", log.brack);
  log.retrn("sanitizeLocationName()", log.kcarb);
  return sanitizeValue(value);
}

export function sanitizeAddress(value: any): string {
  log.enter("sanitizeAddress()", log.brack);
  const cleaned = sanitizeValue(value);
  const sentenceCase = cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase() : '';
  log.retrn("sanitizeAddress()", log.kcarb);
  return sentenceCase;
}

export function sanitizeCity(value: any): string {
  log.enter("sanitizeCity()", log.brack);
  const cleaned = sanitizeValue(value);
  const sentenceCase = cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase() : '';
  log.retrn("sanitizeCity()", log.kcarb);
  return sentenceCase;
}

export function sanitizeState(value: any): string {
  log.enter("sanitizeState()", log.brack);
  log.retrn("sanitizeState()", log.kcarb);
  return sanitizeValue(value);
}

export function sanitizeZip(value: any): string {
  log.enter("sanitizeZip()", log.brack);
  log.retrn("sanitizeZip()", log.kcarb);
  return sanitizeValue(value);
}

export function sanitizePhoneName(value: any): string {
  log.enter("sanitizePhoneName()", log.brack);
  const cleaned = sanitizeValue(value);
  const sentenceCase = cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase() : '';
  log.retrn("sanitizePhoneName()", log.kcarb);
  return sentenceCase;
}

// ============================================================================
// ORGANIZATION-SPECIFIC FIELD SANITIZERS
// ============================================================================

export function sanitizeOrganizationLegalStatus(value: any): string {
  log.enter("sanitizeOrganizationLegalStatus()", log.brack);
  log.retrn("sanitizeOrganizationLegalStatus()", log.kcarb);
  return sanitizeValue(value);
}

export function sanitizeOrganizationPhones(value: any): string {
  log.enter("sanitizePhones()", log.brack);
  const cleaned = sanitizeValue(value);
  const digits = cleaned.replace(/\D/g, '');
  const formatted = digits.length === 10
    ? `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`
    : cleaned;
  log.retrn("sanitizePhones()", log.kcarb);
  return formatted;
}

// ============================================================================
// SERVICE-SPECIFIC FIELD SANITIZERS
// ============================================================================

export function sanitizeServiceShortDescription(value: any): string {
  log.enter("sanitizeServiceShortDescription()", log.brack);
  log.retrn("sanitizeServiceShortDescription()", log.kcarb);
  return sanitizeValue(value);
}

export function sanitizeServiceApplicationProcess(value: any): string {
  log.enter("sanitizeServiceApplicationProcess()", log.brack);
  log.retrn("sanitizeServiceApplicationProcess()", log.kcarb);
  return sanitizeValue(value);
}

export function sanitizeServiceRequiredDocuments(value: any): string {
  log.enter("sanitizeServiceRequiredDocuments()", log.brack);
  log.retrn("sanitizeServiceRequiredDocuments()", log.kcarb);
  return sanitizeValue(value);
}

export function sanitizeServiceInterpretationServices(value: any): string {
  log.enter("sanitizeServiceInterpretationServices()", log.brack);
  log.retrn("sanitizeServiceInterpretationServices()", log.kcarb);
  return sanitizeValue(value);
}

export function sanitizeServiceClinicianActions(value: any): string {
  log.enter("sanitizeServiceClinicianActions()", log.brack);
  log.retrn("sanitizeServiceClinicianActions()", log.kcarb);
  return sanitizeValue(value);
}

export function sanitizeServiceEligibilities(value: any): string {
  log.enter("sanitizeServiceEligibilities()", log.brack);
  log.retrn("sanitizeServiceEligibilities()", log.kcarb);
  return sanitizeValue(value);
}

export function sanitizeServiceCost(value: any): string {
  log.enter("sanitizeServiceCost()", log.brack);
  log.retrn("sanitizeServiceCost()", log.kcarb);
  return sanitizeValue(value);
}

export function sanitizeServiceWaitTime(value: any): string {
  log.enter("sanitizeServiceWaitTime()", log.brack);
  log.retrn("sanitizeServiceWaitTime()", log.kcarb);
  return sanitizeValue(value);
}

export function sanitizeServiceCategories(value: any): string {
  log.enter("sanitizeServiceCategories()", log.brack);
  log.retrn("sanitizeServiceCategories()", log.kcarb);
  return sanitizeValue(value);
}

// #endregion ------------------------------------------------------------------

console.leave();

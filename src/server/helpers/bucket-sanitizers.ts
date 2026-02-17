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
// ORGANIZATION FIELD SANITIZERS
// ============================================================================

export function sanitizeOrganizationInternalNotes(value: any): string {
  log.enter("sanitizeOrganizationInternalNotes()", log.brack);
  log.retrn("sanitizeOrganizationInternalNotes()", log.kcarb);
  return sanitizeValue(value);
}

export function sanitizeOrganizationName(value: any): string {
  log.enter("sanitizeOrganizationName()", log.brack);
  log.retrn("sanitizeOrganizationName()", log.kcarb);
  return sanitizeValue(value);
}

export function sanitizeOrganizationAlternateName(value: any): string {
  log.enter("sanitizeOrganizationAlternateName()", log.brack);
  log.retrn("sanitizeOrganizationAlternateName()", log.kcarb);
  return sanitizeValue(value);
}

export function sanitizeOrganizationLocations(value: any): string {
  log.enter("sanitizeOrganizationLocations()", log.brack);
  log.retrn("sanitizeOrganizationLocations()", log.kcarb);
  return sanitizeValue(value);
}

export function sanitizeOrganizationPhones(value: any): string {
  log.enter("sanitizeOrganizationPhones()", log.brack);
  log.retrn("sanitizeOrganizationPhones()", log.kcarb);
  return sanitizeValue(value);
}

export function sanitizeOrganizationWebsite(value: any): string {
  log.enter("sanitizeOrganizationWebsite()", log.brack);
  log.retrn("sanitizeOrganizationWebsite()", log.kcarb);
  return sanitizeValue(value);
}

export function sanitizeOrganizationEmail(value: any): string {
  log.enter("sanitizeOrganizationEmail()", log.brack);
  log.retrn("sanitizeOrganizationEmail()", log.kcarb);
  return sanitizeValue(value);
}

export function sanitizeOrganizationDescription(value: any): string {
  log.enter("sanitizeOrganizationDescription()", log.brack);
  log.retrn("sanitizeOrganizationDescription()", log.kcarb);
  return sanitizeValue(value);
}

export function sanitizeOrganizationLegalStatus(value: any): string {
  log.enter("sanitizeOrganizationLegalStatus()", log.brack);
  log.retrn("sanitizeOrganizationLegalStatus()", log.kcarb);
  return sanitizeValue(value);
}

export function sanitizeOrganizationHours(value: any): string {
  log.enter("sanitizeOrganizationHours()", log.brack);
  log.retrn("sanitizeOrganizationHours()", log.kcarb);
  return sanitizeValue(value);
}

export function sanitizeOrganizationMarkdownNotes(value: any): string {
  log.enter("sanitizeOrganizationMarkdownNotes()", log.brack);
  log.retrn("sanitizeOrganizationMarkdownNotes()", log.kcarb);
  return sanitizeValue(value);
}

// ============================================================================
// ORGANIZATION LOCATION FIELD SANITIZERS
// ============================================================================

export function sanitizeLocationName(value: any): string {
  log.enter("sanitizeLocationName()", log.brack);
  log.retrn("sanitizeLocationName()", log.kcarb);
  return sanitizeValue(value);
}

export function sanitizeAddress(value: any): string {
  log.enter("sanitizeAddress()", log.brack);
  log.retrn("sanitizeAddress()", log.kcarb);
  return sanitizeValue(value);
}

export function sanitizeCity(value: any): string {
  log.enter("sanitizeCity()", log.brack);
  log.retrn("sanitizeCity()", log.kcarb);
  return sanitizeValue(value);
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

// ============================================================================
// SERVICE FIELD SANITIZERS
// ============================================================================

export function sanitizeServiceInternalNotes(value: any): string {
  log.enter("sanitizeServiceInternalNotes()", log.brack);
  log.retrn("sanitizeServiceInternalNotes()", log.kcarb);
  return sanitizeValue(value);
}

export function sanitizeServiceName(value: any): string {
  log.enter("sanitizeServiceName()", log.brack);
  log.retrn("sanitizeServiceName()", log.kcarb);
  return sanitizeValue(value);
}

export function sanitizeServiceNickname(value: any): string {
  log.enter("sanitizeServiceNickname()", log.brack);
  log.retrn("sanitizeServiceNickname()", log.kcarb);
  return sanitizeValue(value);
}

export function sanitizeServiceLocations(value: any): string {
  log.enter("sanitizeServiceLocations()", log.brack);
  log.retrn("sanitizeServiceLocations()", log.kcarb);
  return sanitizeValue(value);
}

export function sanitizeServiceEmail(value: any): string {
  log.enter("sanitizeServiceEmail()", log.brack);
  log.retrn("sanitizeServiceEmail()", log.kcarb);
  return sanitizeValue(value);
}

export function sanitizeServiceDescription(value: any): string {
  log.enter("sanitizeServiceDescription()", log.brack);
  log.retrn("sanitizeServiceDescription()", log.kcarb);
  return sanitizeValue(value);
}

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

export function sanitizeServiceWebsite(value: any): string {
  log.enter("sanitizeServiceWebsite()", log.brack);
  log.retrn("sanitizeServiceWebsite()", log.kcarb);
  return sanitizeValue(value);
}

export function sanitizeServiceHours(value: any): string {
  log.enter("sanitizeServiceHours()", log.brack);
  log.retrn("sanitizeServiceHours()", log.kcarb);
  return sanitizeValue(value);
}

export function sanitizeServiceMarkdownNotes(value: any): string {
  log.enter("sanitizeServiceMarkdownNotes()", log.brack);
  log.retrn("sanitizeServiceMarkdownNotes()", log.kcarb);
  return sanitizeValue(value);
}

export function sanitizeServiceCategories(value: any): string {
  log.enter("sanitizeServiceCategories()", log.brack);
  log.retrn("sanitizeServiceCategories()", log.kcarb);
  return sanitizeValue(value);
}

// #endregion ------------------------------------------------------------------

console.leave();

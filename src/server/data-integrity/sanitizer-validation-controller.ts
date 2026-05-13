// #region ===================== IMPORTS =======================================
import { extendedConsole as console } from '../../streams/consoles/customConsoles';
import { log } from '../../utils/logger/logger-setup/logger-wrapper';

// Shared
import { nameSanitizeValidateIncomingFromSpreadsheet as sanitizeNameIncoming, nameSanitizeValidateOutgoingToSFSG as sanitizeNameOutgoing } from './shared/name/name.sanitizer-validator';
import { alternateNameSanitizeValidateIncomingFromSpreadsheet as sanitizeAlternateNameIncoming, alternateNameSanitizeValidateOutgoingToSFSG as sanitizeAlternateNameOutgoing } from './shared/alternate-name/alternate-name.sanitizer-validator';
import { websiteSanitizeValidateIncomingFromSpreadsheet as sanitizeWebsiteIncoming, websiteSanitizeValidateOutgoingToSFSG as sanitizeWebsiteOutgoing } from './shared/website/website.sanitizer-validator';
import { emailSanitizeValidateIncomingFromSpreadsheet as sanitizeEmailIncoming, emailSanitizeValidateOutgoingToSFSG as sanitizeEmailOutgoing } from './shared/email/email.sanitizer-validator';
import { descriptionSanitizeValidateIncomingFromSpreadsheet as sanitizeDescriptionIncoming, descriptionSanitizeValidateOutgoingToSFSG as sanitizeDescriptionOutgoing } from './shared/description/description.sanitizer-validator';
import { internalNotesSanitizeValidateIncomingFromSpreadsheet as sanitizeInternalNotesIncoming, internalNotesSanitizeValidateOutgoingToSFSG as sanitizeInternalNotesOutgoing } from './shared/internal-notes/internal-notes.sanitizer-validator';
import { markdownNotesSanitizeValidateIncomingFromSpreadsheet as sanitizeMarkdownNotesIncoming, markdownNotesSanitizeValidateOutgoingToSFSG as sanitizeMarkdownNotesOutgoing } from './shared/markdown-notes/markdown-notes.sanitizer-validator';
import { hoursSanitizeValidateIncomingFromSpreadsheet as sanitizeHoursIncoming, hoursSanitizeValidateOutgoingToSFSG as sanitizeHoursOutgoing } from './shared/hours/hours.sanitizer-validator';

// Location
import { locationNameSanitizeValidateIncomingFromSpreadsheet as sanitizeLocationNameIncoming, locationNameSanitizeValidateOutgoingToSFSG as sanitizeLocationNameOutgoing } from './location/location-name/location-name.sanitizer-validator';
import { addressSanitizeValidateIncomingFromSpreadsheet as sanitizeAddressIncoming, addressSanitizeValidateOutgoingToSFSG as sanitizeAddressOutgoing } from './location/address/address.sanitizer-validator';
import { citySanitizeValidateIncomingFromSpreadsheet as sanitizeCityIncoming, citySanitizeValidateOutgoingToSFSG as sanitizeCityOutgoing } from './location/city/city.sanitizer-validator';
import { stateSanitizeValidateIncomingFromSpreadsheet as sanitizeStateIncoming, stateSanitizeValidateOutgoingToSFSG as sanitizeStateOutgoing } from './location/state/state.sanitizer-validator';
import { zipSanitizeValidateIncomingFromSpreadsheet as sanitizeZipIncoming, zipSanitizeValidateOutgoingToSFSG as sanitizeZipOutgoing } from './location/zip/zip.sanitizer-validator';

// Phone
import { phoneNumberSanitizeValidateIncomingFromSpreadsheet as sanitizePhoneNumberIncoming, phoneNumberSanitizeValidateOutgoingToSFSG as sanitizePhoneNumberOutgoing } from './phone/phone-number/phone-number.sanitizer-validator';
import { phoneNameSanitizeValidateIncomingFromSpreadsheet as sanitizePhoneNameIncoming, phoneNameSanitizeValidateOutgoingToSFSG as sanitizePhoneNameOutgoing } from './phone/phone-name/phone-name.sanitizer-validator';

// Organization
import { legalStatusSanitizeValidateIncomingFromSpreadsheet as sanitizeLegalStatusIncoming, legalStatusSanitizeValidateOutgoingToSFSG as sanitizeLegalStatusOutgoing } from './organization/legal-status/legal-status.sanitizer-validator';

// Service
import { shortDescriptionSanitizeValidateIncomingFromSpreadsheet as sanitizeShortDescriptionIncoming, shortDescriptionSanitizeValidateOutgoingToSFSG as sanitizeShortDescriptionOutgoing } from './service/short-description/short-description.sanitizer-validator';
import { applicationProcessSanitizeValidateIncomingFromSpreadsheet as sanitizeApplicationProcessIncoming, applicationProcessSanitizeValidateOutgoingToSFSG as sanitizeApplicationProcessOutgoing } from './service/application-process/application-process.sanitizer-validator';
import { requiredDocumentsSanitizeValidateIncomingFromSpreadsheet as sanitizeRequiredDocumentsIncoming, requiredDocumentsSanitizeValidateOutgoingToSFSG as sanitizeRequiredDocumentsOutgoing } from './service/required-documents/required-documents.sanitizer-validator';
import { interpretationServicesSanitizeValidateIncomingFromSpreadsheet as sanitizeInterpretationServicesIncoming, interpretationServicesSanitizeValidateOutgoingToSFSG as sanitizeInterpretationServicesOutgoing } from './service/interpretation-services/interpretation-services.sanitizer-validator';
import { clinicianActionsSanitizeValidateIncomingFromSpreadsheet as sanitizeClinicianActionsIncoming, clinicianActionsSanitizeValidateOutgoingToSFSG as sanitizeClinicianActionsOutgoing } from './service/clinician-actions/clinician-actions.sanitizer-validator';
import { costSanitizeValidateIncomingFromSpreadsheet as sanitizeCostIncoming, costSanitizeValidateOutgoingToSFSG as sanitizeCostOutgoing } from './service/cost/cost.sanitizer-validator';
import { waitTimeSanitizeValidateIncomingFromSpreadsheet as sanitizeWaitTimeIncoming, waitTimeSanitizeValidateOutgoingToSFSG as sanitizeWaitTimeOutgoing } from './service/wait-time/wait-time.sanitizer-validator';
import { categoriesSanitizeValidateIncomingFromSpreadsheet as sanitizeCategoriesIncoming, categoriesSanitizeValidateOutgoingToSFSG as sanitizeCategoriesOutgoing } from './service/categories/categories.sanitizer-validator';
import { eligibilitiesSanitizeValidateIncomingFromSpreadsheet as sanitizeEligibilitiesIncoming, eligibilitiesSanitizeValidateOutgoingToSFSG as sanitizeEligibilitiesOutgoing } from './service/eligibilities/eligibilities.sanitizer-validator';
// #endregion ------------------------------------------------------------------



console.enter();

// #region ===================== TYPES =========================================

/** Result of sanitizing a single field value. */
export interface SanitizeResult {
  valid: boolean;
  value: any;
  errors: string[];
}

// #endregion ------------------------------------------------------------------

// #region ===================== BASE UTILITY ==================================

/**
 * Base sanitization — converts null/undefined to empty string and trims whitespace.
 * Used internally by all field sanitizers as the first step.
 */
export function sanitizeValue(value: any): string {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

/**
 * Applies sanitizeValue to every field in every row.
 * Used for bulk pre-cleaning before field-specific sanitization.
 */
export function sanitizeSpreadsheetData(rows: any[]): any[] {
  return rows.map(row => {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(row)) {
      sanitized[key] = sanitizeValue(value);
    }
    return sanitized;
  });
}

// #endregion ------------------------------------------------------------------

// #region ===================== INCOMING (Spreadsheet → DB) ====================

export const incoming = {
  name:                    sanitizeNameIncoming,
  alternateName:           sanitizeAlternateNameIncoming,
  website:                 sanitizeWebsiteIncoming,
  email:                   sanitizeEmailIncoming,
  description:             sanitizeDescriptionIncoming,
  internalNotes:           sanitizeInternalNotesIncoming,
  markdownNotes:           sanitizeMarkdownNotesIncoming,
  hours:                   sanitizeHoursIncoming,
  locationName:            sanitizeLocationNameIncoming,
  address:                 sanitizeAddressIncoming,
  city:                    sanitizeCityIncoming,
  state:                   sanitizeStateIncoming,
  zip:                     sanitizeZipIncoming,
  phoneNumber:             sanitizePhoneNumberIncoming,
  phoneName:               sanitizePhoneNameIncoming,
  legalStatus:             sanitizeLegalStatusIncoming,
  shortDescription:        sanitizeShortDescriptionIncoming,
  applicationProcess:      sanitizeApplicationProcessIncoming,
  requiredDocuments:       sanitizeRequiredDocumentsIncoming,
  interpretationServices:  sanitizeInterpretationServicesIncoming,
  clinicianActions:        sanitizeClinicianActionsIncoming,
  cost:                    sanitizeCostIncoming,
  waitTime:                sanitizeWaitTimeIncoming,
  categories:              sanitizeCategoriesIncoming,
  eligibilities:           sanitizeEligibilitiesIncoming,
};

// #endregion ------------------------------------------------------------------

// #region ===================== OUTGOING (DB → SFSG) ===========================

export const outgoing = {
  name:                    sanitizeNameOutgoing,
  alternateName:           sanitizeAlternateNameOutgoing,
  website:                 sanitizeWebsiteOutgoing,
  email:                   sanitizeEmailOutgoing,
  description:             sanitizeDescriptionOutgoing,
  internalNotes:           sanitizeInternalNotesOutgoing,
  markdownNotes:           sanitizeMarkdownNotesOutgoing,
  hours:                   sanitizeHoursOutgoing,
  locationName:            sanitizeLocationNameOutgoing,
  address:                 sanitizeAddressOutgoing,
  city:                    sanitizeCityOutgoing,
  state:                   sanitizeStateOutgoing,
  zip:                     sanitizeZipOutgoing,
  phoneNumber:             sanitizePhoneNumberOutgoing,
  phoneName:               sanitizePhoneNameOutgoing,
  legalStatus:             sanitizeLegalStatusOutgoing,
  shortDescription:        sanitizeShortDescriptionOutgoing,
  applicationProcess:      sanitizeApplicationProcessOutgoing,
  requiredDocuments:       sanitizeRequiredDocumentsOutgoing,
  interpretationServices:  sanitizeInterpretationServicesOutgoing,
  clinicianActions:        sanitizeClinicianActionsOutgoing,
  cost:                    sanitizeCostOutgoing,
  waitTime:                sanitizeWaitTimeOutgoing,
  categories:              sanitizeCategoriesOutgoing,
  eligibilities:           sanitizeEligibilitiesOutgoing,
};

// #endregion ------------------------------------------------------------------

// #region ===================== VALIDATORS ====================================

/** Result of validating an entire spreadsheet. */
export interface SpreadsheetValidationResult {
  valid: boolean;
  errors: string[];
}

/** Result of validating a single row with all field errors collected. */
export interface RowValidationResult {
  valid: boolean;
  values: Record<string, any>;
  errors: string[];
}

/**
 * Validates spreadsheet-level requirements before processing rows.
 * Checks that the spreadsheet has at least one data row.
 * @param rows - Parsed spreadsheet rows
 */
export function validateSpreadsheetData(rows: any[]): SpreadsheetValidationResult {
  const errors: string[] = [];
  if (!rows || rows.length === 0) {
    errors.push('Spreadsheet contains no data rows');
  }
  return { valid: errors.length === 0, errors };
}

/**
 * Validates and sanitizes all fields for a single spreadsheet row.
 * Runs every field sanitizer and collects ALL errors (does not stop at first failure).
 * A row is invalid if any required field fails OR any provided field has invalid data.
 * @param fieldValues - Object mapping field keys to raw values
 * @returns RowValidationResult with all cleaned values and collected errors
 */
export function validateRow(fieldValues: Record<string, any>): RowValidationResult {
  const errors: string[] = [];
  const values: Record<string, any> = {};

  const fieldMap: Record<string, (value: any) => SanitizeResult> = {
    name:                   incoming.name,
    alternateName:          incoming.alternateName,
    website:                incoming.website,
    email:                  incoming.email,
    description:            incoming.description,
    internalNotes:          incoming.internalNotes,
    legalStatus:            incoming.legalStatus,
    locationName:           incoming.locationName,
    address:                incoming.address,
    city:                   incoming.city,
    state:                  incoming.state,
    zip:                    incoming.zip,
    phoneNumber:            incoming.phoneNumber,
    phoneName:              incoming.phoneName,
    shortDescription:       incoming.shortDescription,
    applicationProcess:     incoming.applicationProcess,
    requiredDocuments:      incoming.requiredDocuments,
    interpretationServices: incoming.interpretationServices,
    clinicianActions:       incoming.clinicianActions,
    cost:                   incoming.cost,
    waitTime:               incoming.waitTime,
    categories:             incoming.categories,
    eligibilities:          incoming.eligibilities,
  };

  for (const [key, sanitizer] of Object.entries(fieldMap)) {
    if (fieldValues[key] !== undefined) {
      const result = sanitizer(fieldValues[key]);
      values[key] = result.value;
      if (!result.valid) {
        errors.push(...result.errors);
      }
    }
  }

  return { valid: errors.length === 0, values, errors };
}

// #endregion ------------------------------------------------------------------

// #region ===================== LEGACY EXPORTS ================================
// These maintain backward compatibility with existing imports in helpers-index.ts
// They call sanitizeIncoming and return just the value (ignoring valid/errors).
// TODO: Update helpers-index.ts to use the new incoming/outgoing API directly.

export function sanitizeName(value: any): string { return sanitizeNameIncoming(value).value; }
export function sanitizeAlternateName(value: any): string { return sanitizeAlternateNameIncoming(value).value; }
export function sanitizeWebsite(value: any): string { return sanitizeWebsiteIncoming(value).value; }
export function sanitizeEmail(value: any): string { return sanitizeEmailIncoming(value).value; }
export function sanitizeDescription(value: any): string { return sanitizeDescriptionIncoming(value).value; }
export function sanitizeInternalNotes(value: any): string { return sanitizeInternalNotesIncoming(value).value; }
export function sanitizeMarkdownNotes(value: any): string { return sanitizeMarkdownNotesIncoming(value).value; }
export function sanitizeHours(value: any): string { return sanitizeHoursIncoming(value).value; }
export function sanitizeLocationName(value: any): string { return sanitizeLocationNameIncoming(value).value; }
export function sanitizeAddress(value: any): string { return sanitizeAddressIncoming(value).value; }
export function sanitizeCity(value: any): string { return sanitizeCityIncoming(value).value; }
export function sanitizeState(value: any): string { return sanitizeStateIncoming(value).value; }
export function sanitizeZip(value: any): string { return sanitizeZipIncoming(value).value; }
export function sanitizeOrganizationPhones(value: any): string { return sanitizePhoneNumberIncoming(value).value; }
export function sanitizePhoneName(value: any): string { return sanitizePhoneNameIncoming(value).value; }
export function sanitizeOrganizationLegalStatus(value: any): string { return sanitizeLegalStatusIncoming(value).value; }
export function sanitizeServiceShortDescription(value: any): string { return sanitizeShortDescriptionIncoming(value).value; }
export function sanitizeServiceApplicationProcess(value: any): string { return sanitizeApplicationProcessIncoming(value).value; }
export function sanitizeServiceRequiredDocuments(value: any): string { return sanitizeRequiredDocumentsIncoming(value).value; }
export function sanitizeServiceInterpretationServices(value: any): string { return sanitizeInterpretationServicesIncoming(value).value; }
export function sanitizeServiceClinicianActions(value: any): string { return sanitizeClinicianActionsIncoming(value).value; }
export function sanitizeServiceCost(value: any): string { return sanitizeCostIncoming(value).value; }
export function sanitizeServiceWaitTime(value: any): string { return sanitizeWaitTimeIncoming(value).value; }
export function sanitizeServiceCategories(value: any): string[] { return sanitizeCategoriesIncoming(value).value; }
export function sanitizeServiceEligibilitiesList(value: any): string[] { return sanitizeEligibilitiesIncoming(value).value; }
export function sanitizeLocations(value: any): string { return sanitizeValue(value); }
export function sanitizeServiceEligibilities(value: any): string { return sanitizeValue(value); }

// #endregion ------------------------------------------------------------------

console.leave();

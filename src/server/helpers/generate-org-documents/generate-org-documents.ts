import { extendedConsole as console } from '../../../streams/consoles/customConsoles';
import { log } from '../../../utils/logger/logger-setup/logger-wrapper';
import { Org, IOrg, ISpreadsheetService } from '../../../database/models/org.model';
import { orgFieldMap, serviceFieldMap, organizationLocationFieldMap, organizationPhoneFieldMap, serviceLocationFieldMap, servicePhoneFieldMap } from '../buckets-map/buckets-map';
import { splitCategoryNames, splitEligibilityNames } from '../category-eligibility-helpers/category-eligibility-helpers';
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
} from '../../data-integrity/sanitizer-validation-controller';
import { IRowResult } from '../report-builder/report-builder';

console.enter();

/**
 * Generates Org documents from spreadsheet rows and inserts them into MongoDB.
 * @param bucketName - The bucket to assign the orgs to
 * @param rows - Spreadsheet row data
 * @param progressCallback - Called with progress percentage after each row
 * @param createServiceFromOrg - If true, creates an additional service from org-level data
 */
export async function generateOrgDocuments(
  bucketName: string,
  rows: any[],
  progressCallback: (progress: number) => void,
  createServiceFromOrg: boolean = false
): Promise<IRowResult[]> {
  log.enter('generateOrgDocuments()', log.brack);

  const results: IRowResult[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    const name = sanitizeName(row[orgFieldMap.organization_name] || '');

    const address1  = sanitizeAddress(row[organizationLocationFieldMap.address] || '');
    const city      = sanitizeCity(row[organizationLocationFieldMap.city] || '');
    const state     = sanitizeState(row[organizationLocationFieldMap.state] || '');
    const zip       = sanitizeZip(row[organizationLocationFieldMap.zip] || '');
    const locName   = sanitizeLocationName(row[organizationLocationFieldMap.location_name] || '');

    const phoneNum  = sanitizeOrganizationPhones(row[organizationPhoneFieldMap.phone] || '');
    const phoneName = sanitizePhoneName(row[organizationPhoneFieldMap.phone_name] || '');

    const orgAddresses: any[] = address1 ? [{ name: locName, address_1: address1, city, state_province: state, postal_code: zip }] : [];
    const orgPhones: any[]    = phoneNum ? [{ number: phoneNum, service_type: phoneName }] : [];

    const svcName = sanitizeName(row[serviceFieldMap.service_name] || '');
    const svcAddr = sanitizeAddress(row[serviceLocationFieldMap.address] || '');
    const svcCity = sanitizeCity(row[serviceLocationFieldMap.city] || '');
    const svcState = sanitizeState(row[serviceLocationFieldMap.state] || '');
    const svcZip  = sanitizeZip(row[serviceLocationFieldMap.zip] || '');
    const svcPhone = sanitizeOrganizationPhones(row[servicePhoneFieldMap.phone] || '');
    const svcPhoneName = sanitizePhoneName(row[servicePhoneFieldMap.phone_name] || '');
    const svcCategories    = sanitizeServiceCategories(row[serviceFieldMap.service_top_categories] || '');
    const svcEligibilities = sanitizeServiceEligibilitiesList(row[serviceFieldMap.service_top_eligibilities] || '');
    const svcCatSplit      = splitCategoryNames(svcCategories);
    const svcEligSplit     = splitEligibilityNames(svcEligibilities);

    const svcLocName = sanitizeLocationName(row[serviceLocationFieldMap.location_name] || '');
    if (svcAddr) orgAddresses.push({ name: svcLocName, address_1: svcAddr, city: svcCity, state_province: svcState, postal_code: svcZip });
    if (svcPhone) orgPhones.push({ number: svcPhone, service_type: svcPhoneName });

    const services: any[] = [];
    if (svcName) {
      services.push({
        name:                            svcName,
        alternate_name:                  sanitizeAlternateName(row[serviceFieldMap.service_alternate_name] || ''),
        email:                           sanitizeEmail(row[serviceFieldMap.service_email] || ''),
        url:                             sanitizeWebsite(row[serviceFieldMap.service_website] || ''),
        fee:                             sanitizeServiceCost(row[serviceFieldMap.service_cost] || ''),
        wait_time:                       sanitizeServiceWaitTime(row[serviceFieldMap.service_wait_time] || ''),
        application_process:             sanitizeServiceApplicationProcess(row[serviceFieldMap.service_application_process] || ''),
        required_documents:              sanitizeServiceRequiredDocuments(row[serviceFieldMap.service_required_documents] || ''),
        interpretation_services:         sanitizeServiceInterpretationServices(row[serviceFieldMap.service_interpretation_services] || ''),
        internal_note:                   sanitizeInternalNotes(row[serviceFieldMap.service_internal_notes] || ''),
        clinician_actions:               sanitizeServiceClinicianActions(row[serviceFieldMap.service_clinician_actions] || ''),
        notes:                           [],
        schedule:                        { schedule_days: [] },
        shouldInheritScheduleFromParent: true,
        eligibilities:                   svcEligSplit.eligibilities,
        sub_eligibilities:               svcEligSplit.sub_eligibilities,
        categories:                      svcCatSplit.categories,
        sub_categories:                  svcCatSplit.sub_categories,
        addresses:                       svcAddr ? [{ name: svcLocName, address_1: svcAddr, city: svcCity, state_province: svcState, postal_code: svcZip }] : [],
        phones:                          svcPhone ? [{ number: svcPhone, service_type: svcPhoneName }] : [],
      });
    }

    const ssCategories    = sanitizeServiceCategories(row[orgFieldMap.organization_top_categories] || '');
    const ssEligibilities = sanitizeServiceEligibilitiesList(row[orgFieldMap.organization_top_eligibilities] || '');
    const ssCatSplit      = splitCategoryNames(ssCategories);
    const ssEligSplit     = splitEligibilityNames(ssEligibilities);

    if (createServiceFromOrg && name) {
      services.push({
        name,
        alternate_name:                  sanitizeAlternateName(row[orgFieldMap.organization_alternate_name] || ''),
        email:                           sanitizeEmail(row[orgFieldMap.organization_email] || ''),
        url:                             sanitizeWebsite(row[orgFieldMap.organization_website] || ''),
        fee:                             '',
        wait_time:                       '',
        application_process:             '',
        required_documents:              '',
        interpretation_services:         '',
        internal_note:                   sanitizeInternalNotes(row[orgFieldMap.organization_internal_notes] || ''),
        clinician_actions:               '',
        notes:                           [],
        schedule:                        { schedule_days: [] },
        shouldInheritScheduleFromParent: true,
        eligibilities:                   ssEligSplit.eligibilities,
        sub_eligibilities:               ssEligSplit.sub_eligibilities,
        categories:                      ssCatSplit.categories,
        sub_categories:                  ssCatSplit.sub_categories,
        addresses:                       address1 ? [{ name: locName, address_1: address1, city, state_province: state, postal_code: zip }] : [],
        phones:                          phoneNum ? [{ number: phoneNum, service_type: phoneName }] : [],
      });
    }

    const orgDoc: Partial<IOrg> = {
      name:             name || `New Service ${i + 1}`,
      alternate_name:   sanitizeAlternateName(row[orgFieldMap.organization_alternate_name] || ''),
      website:          sanitizeWebsite(row[orgFieldMap.organization_website] || ''),
      email:            sanitizeEmail(row[orgFieldMap.organization_email] || ''),
      long_description: sanitizeDescription(row[orgFieldMap.organization_description] || ''),
      legal_status:     sanitizeOrganizationLegalStatus(row[orgFieldMap.organization_legal_status] || ''),
      internal_note:    sanitizeInternalNotes(row[orgFieldMap.organization_internal_notes] || ''),
      bucket:    bucketName,
      status:    'incomplete',
      addresses: orgAddresses,
      phones:    orgPhones,
      notes:     [],
      schedule:  { schedule_days: [] },
      services,
      spreadsheetService: {
        name:                            name,
        alternate_name:                  sanitizeAlternateName(row[orgFieldMap.organization_alternate_name] || ''),
        email:                           sanitizeEmail(row[orgFieldMap.organization_email] || ''),
        url:                             sanitizeWebsite(row[orgFieldMap.organization_website] || ''),
        long_description:                sanitizeDescription(row[orgFieldMap.organization_description] || ''),
        fee:                             '',
        wait_time:                       '',
        application_process:             '',
        required_documents:              '',
        interpretation_services:         '',
        internal_note:                   sanitizeInternalNotes(row[orgFieldMap.organization_internal_notes] || ''),
        clinician_actions:               '',
        notes:                           [],
        schedule:                        { schedule_days: [] },
        shouldInheritScheduleFromParent: true,
        eligibilities:                   ssEligSplit.eligibilities,
        sub_eligibilities:               ssEligSplit.sub_eligibilities,
        categories:                      ssCatSplit.categories,
        sub_categories:                  ssCatSplit.sub_categories,
        addresses:                       address1 ? [{ name: locName, address_1: address1, city, state_province: state, postal_code: zip }] : [],
        phones:                          phoneNum ? [{ number: phoneNum, service_type: phoneName }] : [],
      } as ISpreadsheetService,
      history: [{ action: 'created', by: 'unknown', at: new Date(), detail: `imported from spreadsheet` }],
    };

    try {
      await Org.create(orgDoc);
      results.push({ row: i, status: 'Success', detail: '' });
    } catch (err: any) {
      results.push({ row: i, status: 'Failed', detail: err.message || String(err) });
    }

    progressCallback(Math.round(((i + 1) / rows.length) * 100));
  }

  log.retrn('generateOrgDocuments()', log.kcarb);
  return results;
}

console.leave();

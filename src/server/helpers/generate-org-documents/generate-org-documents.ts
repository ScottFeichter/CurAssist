import { extendedConsole as console } from '../../../streams/consoles/customConsoles';
import { log } from '../../../utils/logger/logger-setup/logger-wrapper';
import { Org, IOrg, ISpreadsheetService } from '../../../database/models/org.model';
import { orgFieldMap, serviceFieldMap, organizationLocationFieldMap, organizationPhoneFieldMap, serviceLocationFieldMap, servicePhoneFieldMap } from '../buckets-map/buckets-map';
import { incoming, SanitizeResult } from '../../data-integrity/sanitizer-validation-controller';
import { IRowResult, IFieldResult } from '../report-builder/report-builder';

console.enter();

/**
 * Processes a raw value through a sanitizer and returns an IFieldResult.
 */
function processField(rawValue: any, sanitizer: (v: any) => SanitizeResult): IFieldResult {
  const raw = rawValue ?? '';
  if (raw === '' || raw === null || raw === undefined) {
    return { status: 'n/a', value: 'n/a' };
  }
  const result = sanitizer(raw);
  if (result.valid) {
    return { status: 'success', value: String(result.value) };
  }
  return { status: 'failure', value: result.errors.join('; ') };
}

/**
 * Processes a raw value through a sanitizer for array fields (categories/eligibilities).
 */
function processArrayField(rawValue: any, sanitizer: (v: any) => SanitizeResult): IFieldResult {
  const raw = rawValue ?? '';
  if (raw === '' || raw === null || raw === undefined) {
    return { status: 'n/a', value: 'n/a' };
  }
  const result = sanitizer(raw);
  if (result.valid) {
    const arr = result.value as string[];
    return { status: 'success', value: arr.length ? arr.join(', ') : 'n/a' };
  }
  return { status: 'failure', value: result.errors.join('; ') };
}

/**
 * Generates Org documents from spreadsheet rows and inserts them into MongoDB.
 * Validates ALL fields per row and collects errors before deciding pass/fail.
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
    const fields: Record<string, IFieldResult> = {};
    const errors: string[] = [];

    // ── Organization scalar fields ─────────────────────────────────────────
    const nameResult = incoming.name(row[orgFieldMap.organization_name] || '');
    fields.name = nameResult.valid
      ? { status: 'success', value: nameResult.value }
      : { status: 'failure', value: nameResult.errors.join('; ') };
    if (!nameResult.valid) errors.push(`Name: ${nameResult.errors.join('; ')}`);
    // Name gets a fallback for the DB even if empty
    const nameVal = nameResult.value || `New Service ${i + 1}`;

    fields.nickname = processField(row[orgFieldMap.organization_alternate_name], incoming.alternateName);
    if (fields.nickname.status === 'failure') errors.push(`Nickname: ${fields.nickname.value}`);

    fields.website = processField(row[orgFieldMap.organization_website], incoming.website);
    if (fields.website.status === 'failure') errors.push(`Website: ${fields.website.value}`);

    fields.email = processField(row[orgFieldMap.organization_email], incoming.email);
    if (fields.email.status === 'failure') errors.push(`Email: ${fields.email.value}`);

    fields.description = processField(row[orgFieldMap.organization_description], incoming.description);
    if (fields.description.status === 'failure') errors.push(`Description: ${fields.description.value}`);

    fields.legalStatus = processField(row[orgFieldMap.organization_legal_status], incoming.legalStatus);
    if (fields.legalStatus.status === 'failure') errors.push(`Legal Status: ${fields.legalStatus.value}`);

    fields.internalNotes = processField(row[orgFieldMap.organization_internal_notes], incoming.internalNotes);
    if (fields.internalNotes.status === 'failure') errors.push(`Internal Notes: ${fields.internalNotes.value}`);

    // ── Organization location ──────────────────────────────────────────────
    fields.locationName = processField(row[organizationLocationFieldMap.location_name], incoming.locationName);
    if (fields.locationName.status === 'failure') errors.push(`Location Name: ${fields.locationName.value}`);

    fields.address = processField(row[organizationLocationFieldMap.address], incoming.address);
    if (fields.address.status === 'failure') errors.push(`Address: ${fields.address.value}`);

    fields.city = processField(row[organizationLocationFieldMap.city], incoming.city);
    if (fields.city.status === 'failure') errors.push(`City: ${fields.city.value}`);

    fields.state = processField(row[organizationLocationFieldMap.state], incoming.state);
    if (fields.state.status === 'failure') errors.push(`State: ${fields.state.value}`);

    fields.zip = processField(row[organizationLocationFieldMap.zip], incoming.zip);
    if (fields.zip.status === 'failure') errors.push(`Zip: ${fields.zip.value}`);

    // ── Organization phone ─────────────────────────────────────────────────
    fields.phoneName = processField(row[organizationPhoneFieldMap.phone_name], incoming.phoneName);
    if (fields.phoneName.status === 'failure') errors.push(`Phone Name: ${fields.phoneName.value}`);

    fields.phone = processField(row[organizationPhoneFieldMap.phone], incoming.phoneNumber);
    if (fields.phone.status === 'failure') errors.push(`Phone: ${fields.phone.value}`);

    // ── Service fields ─────────────────────────────────────────────────────
    fields.serviceName = processField(row[serviceFieldMap.service_name], incoming.name);
    if (fields.serviceName.status === 'failure') errors.push(`Service Name: ${fields.serviceName.value}`);

    fields.serviceAlternateName = processField(row[serviceFieldMap.service_alternate_name], incoming.alternateName);
    if (fields.serviceAlternateName.status === 'failure') errors.push(`Service Alternate Name: ${fields.serviceAlternateName.value}`);

    fields.serviceEmail = processField(row[serviceFieldMap.service_email], incoming.email);
    if (fields.serviceEmail.status === 'failure') errors.push(`Service Email: ${fields.serviceEmail.value}`);

    fields.serviceWebsite = processField(row[serviceFieldMap.service_website], incoming.website);
    if (fields.serviceWebsite.status === 'failure') errors.push(`Service Website: ${fields.serviceWebsite.value}`);

    fields.serviceDescription = processField(row[serviceFieldMap.service_description], incoming.description);
    if (fields.serviceDescription.status === 'failure') errors.push(`Service Description: ${fields.serviceDescription.value}`);

    fields.serviceShortDescription = processField(row[serviceFieldMap.service_short_description], incoming.shortDescription);
    if (fields.serviceShortDescription.status === 'failure') errors.push(`Service Short Description: ${fields.serviceShortDescription.value}`);

    fields.serviceApplicationProcess = processField(row[serviceFieldMap.service_application_process], incoming.applicationProcess);
    if (fields.serviceApplicationProcess.status === 'failure') errors.push(`Service Application Process: ${fields.serviceApplicationProcess.value}`);

    fields.serviceRequiredDocuments = processField(row[serviceFieldMap.service_required_documents], incoming.requiredDocuments);
    if (fields.serviceRequiredDocuments.status === 'failure') errors.push(`Service Required Documents: ${fields.serviceRequiredDocuments.value}`);

    fields.serviceInterpretationServices = processField(row[serviceFieldMap.service_interpretation_services], incoming.interpretationServices);
    if (fields.serviceInterpretationServices.status === 'failure') errors.push(`Service Interpretation Services: ${fields.serviceInterpretationServices.value}`);

    fields.serviceClinicianActions = processField(row[serviceFieldMap.service_clinician_actions], incoming.clinicianActions);
    if (fields.serviceClinicianActions.status === 'failure') errors.push(`Service Clinician Actions: ${fields.serviceClinicianActions.value}`);

    fields.serviceCost = processField(row[serviceFieldMap.service_cost], incoming.cost);
    if (fields.serviceCost.status === 'failure') errors.push(`Service Cost: ${fields.serviceCost.value}`);

    fields.serviceWaitTime = processField(row[serviceFieldMap.service_wait_time], incoming.waitTime);
    if (fields.serviceWaitTime.status === 'failure') errors.push(`Service Wait Time: ${fields.serviceWaitTime.value}`);

    fields.serviceInternalNotes = processField(row[serviceFieldMap.service_internal_notes], incoming.internalNotes);
    if (fields.serviceInternalNotes.status === 'failure') errors.push(`Service Internal Notes: ${fields.serviceInternalNotes.value}`);

    // Service location
    fields.serviceLocationName = processField(row[serviceLocationFieldMap.location_name], incoming.locationName);
    if (fields.serviceLocationName.status === 'failure') errors.push(`Service Location Name: ${fields.serviceLocationName.value}`);

    fields.serviceAddress = processField(row[serviceLocationFieldMap.address], incoming.address);
    if (fields.serviceAddress.status === 'failure') errors.push(`Service Address: ${fields.serviceAddress.value}`);

    fields.serviceCity = processField(row[serviceLocationFieldMap.city], incoming.city);
    if (fields.serviceCity.status === 'failure') errors.push(`Service City: ${fields.serviceCity.value}`);

    fields.serviceState = processField(row[serviceLocationFieldMap.state], incoming.state);
    if (fields.serviceState.status === 'failure') errors.push(`Service State: ${fields.serviceState.value}`);

    fields.serviceZip = processField(row[serviceLocationFieldMap.zip], incoming.zip);
    if (fields.serviceZip.status === 'failure') errors.push(`Service Zip: ${fields.serviceZip.value}`);

    // Service phone
    fields.servicePhone = processField(row[servicePhoneFieldMap.phone], incoming.phoneNumber);
    if (fields.servicePhone.status === 'failure') errors.push(`Service Phone: ${fields.servicePhone.value}`);

    fields.servicePhoneName = processField(row[servicePhoneFieldMap.phone_name], incoming.phoneName);
    if (fields.servicePhoneName.status === 'failure') errors.push(`Service Phone Name: ${fields.servicePhoneName.value}`);

    // Service categories/eligibilities
    fields.serviceCategories = processArrayField(row[serviceFieldMap.service_top_categories], incoming.categories);
    if (fields.serviceCategories.status === 'failure') errors.push(`Service Categories: ${fields.serviceCategories.value}`);

    fields.serviceEligibilities = processArrayField(row[serviceFieldMap.service_top_eligibilities], incoming.eligibilities);
    if (fields.serviceEligibilities.status === 'failure') errors.push(`Service Eligibilities: ${fields.serviceEligibilities.value}`);

    // ── If any field failed, mark row as failed but still record all results ─
    if (errors.length > 0) {
      results.push({ row: i, status: 'Failed', detail: errors.join(' | '), fields });
      progressCallback(Math.round(((i + 1) / rows.length) * 100));
      continue;
    }

    // ── Build org document from validated/sanitized values ──────────────────
    const getVal = (field: IFieldResult): string => field.status === 'success' ? field.value : '';
    const getArr = (field: IFieldResult): string[] => {
      if (field.status !== 'success' || field.value === 'n/a') return [];
      return field.value.split(', ').filter(Boolean);
    };

    const orgAddresses: any[] = [];
    if (getVal(fields.address)) {
      orgAddresses.push({
        name: getVal(fields.locationName),
        address_1: getVal(fields.address),
        city: getVal(fields.city),
        state_province: getVal(fields.state),
        postal_code: getVal(fields.zip)
      });
    }

    const orgPhones: any[] = [];
    if (getVal(fields.phone)) {
      orgPhones.push({ number: getVal(fields.phone), service_type: getVal(fields.phoneName) });
    }

    // Service location/phone for org-level arrays
    if (getVal(fields.serviceAddress)) {
      orgAddresses.push({
        name: getVal(fields.serviceLocationName),
        address_1: getVal(fields.serviceAddress),
        city: getVal(fields.serviceCity),
        state_province: getVal(fields.serviceState),
        postal_code: getVal(fields.serviceZip)
      });
    }
    if (getVal(fields.servicePhone)) {
      orgPhones.push({ number: getVal(fields.servicePhone), service_type: getVal(fields.servicePhoneName) });
    }

    const svcCategories = getArr(fields.serviceCategories);
    const svcEligibilities = getArr(fields.serviceEligibilities);

    const services: any[] = [];
    const svcName = getVal(fields.serviceName);
    if (svcName) {
      services.push({
        name:                            svcName,
        alternate_name:                  getVal(fields.serviceAlternateName),
        email:                           getVal(fields.serviceEmail),
        url:                             getVal(fields.serviceWebsite),
        fee:                             getVal(fields.serviceCost),
        wait_time:                       getVal(fields.serviceWaitTime),
        long_description:                getVal(fields.serviceDescription),
        short_description:               getVal(fields.serviceShortDescription),
        application_process:             getVal(fields.serviceApplicationProcess),
        required_documents:              getVal(fields.serviceRequiredDocuments),
        interpretation_services:         getVal(fields.serviceInterpretationServices),
        internal_note:                   getVal(fields.serviceInternalNotes),
        clinician_actions:               getVal(fields.serviceClinicianActions),
        notes:                           [],
        schedule:                        { schedule_days: [] },
        shouldInheritScheduleFromParent: true,
        eligibilities:                   svcEligibilities,
        categories:                      svcCategories,
        addresses:                       getVal(fields.serviceAddress) ? [{ name: getVal(fields.serviceLocationName), address_1: getVal(fields.serviceAddress), city: getVal(fields.serviceCity), state_province: getVal(fields.serviceState), postal_code: getVal(fields.serviceZip) }] : [],
        phones:                          getVal(fields.servicePhone) ? [{ number: getVal(fields.servicePhone), service_type: getVal(fields.servicePhoneName) }] : [],
      });
    }

    // Org-level categories/eligibilities for spreadsheetService
    const ssCategories = incoming.categories(row[orgFieldMap.organization_top_categories] || '').value || [];
    const ssEligibilities = incoming.eligibilities(row[orgFieldMap.organization_top_eligibilities] || '').value || [];

    if (createServiceFromOrg && nameVal) {
      services.push({
        name:                            nameVal,
        alternate_name:                  getVal(fields.nickname),
        email:                           getVal(fields.email),
        url:                             getVal(fields.website),
        fee:                             '',
        wait_time:                       '',
        application_process:             '',
        required_documents:              '',
        interpretation_services:         '',
        internal_note:                   getVal(fields.internalNotes),
        clinician_actions:               '',
        notes:                           [],
        schedule:                        { schedule_days: [] },
        shouldInheritScheduleFromParent: true,
        eligibilities:                   ssEligibilities,
        categories:                      ssCategories,
        addresses:                       getVal(fields.address) ? [{ name: getVal(fields.locationName), address_1: getVal(fields.address), city: getVal(fields.city), state_province: getVal(fields.state), postal_code: getVal(fields.zip) }] : [],
        phones:                          getVal(fields.phone) ? [{ number: getVal(fields.phone), service_type: getVal(fields.phoneName) }] : [],
      });
    }

    const orgDoc: Partial<IOrg> = {
      name:             nameVal,
      alternate_name:   getVal(fields.nickname),
      website:          getVal(fields.website),
      email:            getVal(fields.email),
      long_description: getVal(fields.description),
      legal_status:     getVal(fields.legalStatus),
      internal_note:    getVal(fields.internalNotes),
      bucket:           bucketName,
      status:           'incomplete',
      addresses:        orgAddresses,
      phones:           orgPhones,
      notes:            [],
      schedule:         { schedule_days: [] },
      services,
      spreadsheetService: {
        name:                            nameVal,
        alternate_name:                  getVal(fields.nickname),
        email:                           getVal(fields.email),
        url:                             getVal(fields.website),
        long_description:                getVal(fields.description),
        fee:                             '',
        wait_time:                       '',
        application_process:             '',
        required_documents:              '',
        interpretation_services:         '',
        internal_note:                   getVal(fields.internalNotes),
        clinician_actions:               '',
        notes:                           [],
        schedule:                        { schedule_days: [] },
        shouldInheritScheduleFromParent: true,
        eligibilities:                   ssEligibilities,
        categories:                      ssCategories,
        addresses:                       getVal(fields.address) ? [{ name: getVal(fields.locationName), address_1: getVal(fields.address), city: getVal(fields.city), state_province: getVal(fields.state), postal_code: getVal(fields.zip) }] : [],
        phones:                          getVal(fields.phone) ? [{ number: getVal(fields.phone), service_type: getVal(fields.phoneName) }] : [],
      } as ISpreadsheetService,
      history: [{ action: 'created', by: 'unknown', at: new Date(), detail: 'imported from spreadsheet' }],
    };

    try {
      const created = await Org.create(orgDoc);
      fields.orgId = { status: 'success', value: String(created._id) };
      results.push({ row: i, status: 'Success', detail: '', orgId: String(created._id), fields });
    } catch (err: any) {
      results.push({ row: i, status: 'Failed', detail: `DB Error: ${err.message || String(err)}`, fields });
    }

    progressCallback(Math.round(((i + 1) / rows.length) * 100));
  }

  log.retrn('generateOrgDocuments()', log.kcarb);
  return results;
}

console.leave();

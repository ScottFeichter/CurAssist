/**
 * Barrel file — re-exports all helper functions from their dedicated modules.
 * Maintains backward compatibility with existing imports throughout the codebase.
 */

export { createBucketStructure, parseSpreadsheet, validateHeaders, normalizeHeaders } from './spreadsheet-parser/spreadsheet-parser';
export { generateOrgDocuments } from './generate-org-documents/generate-org-documents';
export type { IRowResult } from './report-builder/report-builder';
export type { ISfsgResult } from './report-builder/report-builder';
export type { IFieldResult } from './report-builder/report-builder';
export { buildReportBuffer } from './report-builder/report-builder';
export { normalizeSFSGStringArray, extractSFSGCategories, extractSFSGEligibilities, topCategoryNames, topEligibilityNames } from './category-eligibility-helpers/category-eligibility-helpers';
export { transformOrgToSFPayload } from './transform-org-to-sf-payload/transform-org-to-sf-payload';
export { hydrateTemplate } from './hydrate-template/hydrate-template';

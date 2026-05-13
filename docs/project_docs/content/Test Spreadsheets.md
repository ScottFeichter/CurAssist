# content/Test Spreadsheets/

This directory contains sample spreadsheet files used for testing the bucket creation import flow.

## Files

| File | Purpose |
|------|---------|
| `TestSheetDCYF.ods` | Test spreadsheet mimicking a DCYF data batch |
| `TestSheetDirectTest.ods` | Test spreadsheet for the direct submit flow |
| `Bucket_PrivateSchools/Bucket_PrivateSchools.ods` | Test spreadsheet for private schools batch |

These are `.ods` (OpenDocument Spreadsheet) files that can be uploaded via the "Create Bucket" modal to test the import pipeline. They contain sample org/service data with the expected column headers defined in `buckets-map.ts`.

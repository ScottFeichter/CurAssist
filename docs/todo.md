# CurAssist Todo

## In Progress

- **Spreadsheet import creates org+service instead of standalone service** — when a spreadsheet row is imported, it creates an Org document with the data embedded as `org.services[0]`. But spreadsheet rows should be usable as either an org OR a standalone service (user decides via the toggle). The service toggle currently shows redundant org data instead of populating service fields from the spreadsheet data. Needs a separate data model/hydration path for "spreadsheet service" mode.

---

## Bugs

- **Submit 500 error** — `POST /api/sf/resources` returns 500 when org has a populated `addresses` array. Working payload only ever sent `addresses: []`. Need to determine if SFSG accepts addresses on initial create or requires them via `change_requests` after org exists.



- **Modal OK button colors** — some OK buttons use the same color as Submit buttons. Should use a neutral color unless in the submit workflow itself.

- When deleting a bucket, if you type "delete" and tab and press enter, a browser alert appears saying you must type "delete" exactly even though it's already there. Works fine with mouse click.

- in the create bucket modal these items should be exclusive so if one is checked the other cannot be checked:

Create empty bucket (no spreadsheet)
Submit directly to SF Service Guide (skip curation)

the create bucket model has what looks like a wanna be progress bar when creating but it is doesn't track anything

- Where I do things to buckets such as delete, the list of buckets gets out of whack and I have to refresh the browser.

in the copy file modal the copy without saving is a bit scrunched

in its success modal lets have a line break in the text

lets have words be something like "file successfully moved to
                                        bucket: bucket name
                                        sub directory: sub dir name

delete modal add line break between sentances in both the 1st and 2nd

line break and padding in success modal for import file

some times a modal will go away while something is in process and it is impossible to tell if the process is still working until a new success or fail modal appears

- Add time picker not working
- Inherit schedule in service not working
- Add markdown note in organization not working

---

## Deferred

- When org name is changed update the record name in the file list
- User authentication — replace 'unknown' in history[].by with real user identity
- Bucket-level metadata (notes, source spreadsheet name, batch size)
- File-level soft locking (concurrency Option B)
- E2E tests (Playwright or Cypress) — would catch the bugs listed above
- Integration tests for import-file, create-bucket-empty, create-bucket-spreadsheet routes

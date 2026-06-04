general UI
=========================

the locations in org services do not appear to be being save when we do the save also they are making like a circular reference or something

        - when adding an address from an organization it seems to make 4 copies of it in the service



when changing the name of organization the spreadsheet service name does not change with it - should it?



when changing the name of an organization it does not change the file name in the drop down unless I refresh browser

        - when saving should the bucket files refresh but still stay on the current file? also for create? delete? currently I have to refresh the browser

        - when creating file from existing file it doesn't pull up the new file it goes to first file in list

        - they actually might be saving...but the file list seems to put some new things at top and somethings at bottom in other words not following the alphabetical?


tab control
=========================
the tabing focus works but when opening a model it doesn't focus in the modal

also how to have the first press of tab go in to the app rather than around the horn of the browser tabs etc...

also keys to go from ui controls to actual record fields

and make one of those modes where the key shortcuts show up in the ui




scripts
=========================
write in automated Deactivation script for when done with a test batch to deactivate timely



field tests
=========================

If there is absolutely no address info this is not a problem for submit. But if there is some address info but not complete the ideal is to not allow submit with information what is missing.


Address

Q: should a record with an address that does not have a city, state, or zip be rejected?
A: allow it to enter curassist but it should not be able to be submitted to sfsg with incomplete address. when submitted should be prevented and noted on the report if a multi submit. if individual submit same but with a note saying why it won't be submitted (along with whatever else is needed to be completed)

City

A: let it get in to curassist but don't let it be submitted

State

A: same

Zip

A: same





The Service Markdown note is not coming through to CurAssist from spreadsheet - what is this field called? Also it is a modal but should be a field that appears in the form rather than a modal.

The Organization Markdown note is not coming through to CurAssist from spreadsheet - and it does not do anything when clicked in CurAssist.

The Service Address and Service Phone info comes through but it does not show up on the service it is only in the organization

Clinical Actions is not getting through from CurAssist to SFSG


Catagory and Eligibility enhancements
=========================
Categories should be 2 fields Top Catagory and Sub Catagories. There must be at least one Top and one Sub and the Sub must have its Top listed.

Same with eligibility.

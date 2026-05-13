# content/Templates/inject-values.js

This module provides regex-based HTML injection helpers used by `hydrateTemplate()` in `bucket-helpers.ts` to populate the template with org data at request time.

---

## Functions

### injectInput(html, id, value)
```javascript
html.replace(
  new RegExp(`(<input[^>]*id="${id}"[^>]*value=")[^"]*(")`),
  `$1${value}$2`
);
```
Finds an `<input>` with the given `id` and replaces its `value` attribute content. The regex matches everything up to `value="`, captures it, then replaces the value between the quotes.

### injectTextarea(html, id, value)
```javascript
html.replace(
  new RegExp(`(<textarea[^>]*id="${id}"[^>]*>)[\\s\\S]*?(</textarea>)`),
  `$1${value}$2`
);
```
Finds a `<textarea>` with the given `id` and replaces its inner content (between opening and closing tags).

### injectPhoneList(html, listId, phoneHtml)
Replaces the contents of a `<ul>` with the given `id` with pre-built phone list HTML.

### injectLocationDiv(html, divId, locationHtml)
Replaces the contents of a `<div>` with the given `id` with pre-built location HTML.

---

## Why Regex Instead of DOM Parsing?

The template is a static HTML string on the server (not a live DOM). Using regex is simpler and faster than parsing into a DOM tree, manipulating, and serializing back. The trade-off is fragility — if the template structure changes unexpectedly, the regex might not match. This is acceptable because the template is controlled and predictable.

---

## Usage

```javascript
const { injectInput, injectTextarea } = require('./inject-values');
html = injectInput(html, 'organization_name', 'Some Org');
html = injectTextarea(html, 'organization_description', 'A description...');
```

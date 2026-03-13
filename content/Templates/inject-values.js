/**
 * inject-values.js
 *
 * Shared HTML value injection helpers used by:
 *   - build-test-template.js (build-time test file generation)
 *   - bucket-helpers.ts (server-side create bucket flow)
 */

function injectInput(html, id, value) {
  return html.replace(
    new RegExp(`(<input[^>]*id="${id}"[^>]*value=")[^"]*(")`,'gi'),
    `$1${value}$2`
  );
}

function injectTextarea(html, id, value) {
  return html.replace(
    new RegExp(`(<textarea[^>]*id="${id}"[^>]*>)[\\s\\S]*?(<\\/textarea>)`, 'gi'),
    `$1${value}$2`
  );
}

function injectPhoneList(html, listId, phoneHtml) {
  return html.replace(
    new RegExp(`(<ul[^>]*id="${listId}"[^>]*>)([\\s\\S]*?)(<\\/ul>)`),
    `$1${phoneHtml}$3`
  );
}

function injectLocationDiv(html, divId, locationHtml) {
  return html.replace(
    new RegExp(`(<div[^>]*id="${divId}"[^>]*>)([\\s\\S]*?)(<\\/div>)`),
    `$1${locationHtml}$3`
  );
}

module.exports = { injectInput, injectTextarea, injectPhoneList, injectLocationDiv };

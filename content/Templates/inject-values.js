/**
 * inject-values.js
 *
 * Shared HTML value injection helpers used by:
 *   - build-test-template.js (build-time test file generation)
 *   - bucket-helpers.ts (server-side create bucket flow)
 */

/**
 * Sets the value attribute of an <input> with the given id.
 * @param {string} html
 * @param {string} id
 * @param {string} value
 * @returns {string}
 */
function injectInput(html, id, value) {
  return html.replace(
    new RegExp(`(<input[^>]*id="${id}"[^>]*value=")[^"]*(")`,'gi'),
    `$1${value}$2`
  );
}

/**
 * Sets the inner content of a <textarea> with the given id.
 * @param {string} html
 * @param {string} id
 * @param {string} value
 * @returns {string}
 */
function injectTextarea(html, id, value) {
  return html.replace(
    new RegExp(`(<textarea[^>]*id="${id}"[^>]*>)[\\s\\S]*?(<\\/textarea>)`, 'gi'),
    `$1${value}$2`
  );
}

/**
 * Replaces the contents of a <ul> with the given id with the provided HTML.
 * @param {string} html
 * @param {string} listId
 * @param {string} phoneHtml
 * @returns {string}
 */
function injectPhoneList(html, listId, phoneHtml) {
  return html.replace(
    new RegExp(`(<ul[^>]*id="${listId}"[^>]*>)([\\s\\S]*?)(<\\/ul>)`),
    `$1${phoneHtml}$3`
  );
}

/**
 * Replaces the contents of a <div> with the given id with the provided HTML.
 * @param {string} html
 * @param {string} divId
 * @param {string} locationHtml
 * @returns {string}
 */
function injectLocationDiv(html, divId, locationHtml) {
  return html.replace(
    new RegExp(`(<div[^>]*id="${divId}"[^>]*>)([\\s\\S]*?)(<\\/div>)`),
    `$1${locationHtml}$3`
  );
}

module.exports = { injectInput, injectTextarea, injectPhoneList, injectLocationDiv };

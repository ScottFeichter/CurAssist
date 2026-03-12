/**
 * Build Template Script
 *
 * Combines orgServTemplate components into a single HTML file.
 *
 * Usage:
 *   node build-template.js [filename] [output-path]
 *
 * Arguments:
 *   filename    - (optional) Name of output file. Default: 'orgServTemplate-combined.html'
 *   output-path - (optional) Directory for output file. Default: current directory
 *
 * Examples:
 *   node build-template.js
 *   node build-template.js myTemplate.html
 *   node build-template.js myTemplate.html /path/to/output
 */

const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'orgServTemplate Components');
const outputName = process.argv[2] || 'orgServTemplate-combined.html';
const outputPath = process.argv[3] || __dirname;
const outputFile = path.join(outputPath, outputName);

// Wraps each <script> block's contents in {} to block-scope const declarations
function blockScopeScripts(html) {
  return html.replace(/<script>([\s\S]*?)<\/script>/g, (_, inner) => `<script>{\n${inner}}\n</script>`);
}

// Extracts content between <body> and </body> from a full HTML document
function bodyContent(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const start = raw.indexOf('<body');
  const end = raw.lastIndexOf('</body>');
  if (start === -1 || end === -1) return raw;
  const bodyTag = raw.indexOf('>', start) + 1;
  return raw.slice(bodyTag, end).trim();
}

// Extracts component-specific <style> blocks from a full HTML document's <head>
// (i.e. any style blocks that appear after the base head content ends)
function componentStyles(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const headEnd = raw.indexOf('</head>');
  if (headEnd === -1) return '';
  const headSection = raw.slice(0, headEnd);
  // The base head content ends where the last minified style block from orgServTemplate-head.html ends.
  // Component-specific styles are the last <style>...</style> block before </head> that doesn't contain sourceMappingURL
  const styleBlocks = [...headSection.matchAll(/<style>([\/\s\S]*?)<\/style>/g)];
  return styleBlocks
    .filter(m => !m[1].includes('sourceMappingURL') && !m[1].includes('@import'))
    .map(m => `<style>${m[1]}</style>`)
    .join('\n');
}

// Read all component files
// Fragments (not full HTML docs) — read as-is
const timePicker = fs.readFileSync(path.join(componentsDir, '_timePicker.html'), 'utf8');
const html = fs.readFileSync(path.join(componentsDir, 'orgServTemplate-html.html'), 'utf8');
const head = fs.readFileSync(path.join(componentsDir, 'orgServTemplate-head.html'), 'utf8');
const bodySkeleton = fs.readFileSync(path.join(componentsDir, 'orgServTemplate-body-skeleton.html'), 'utf8');
// Full HTML documents — extract body content only
const header = bodyContent(path.join(componentsDir, 'orgServTemplate-body-Header.html'));
const navBar = bodyContent(path.join(componentsDir, 'orgServTemplate-navBar.html'));
const orgDiv = bodyContent(path.join(componentsDir, 'orgServTemplate-body-OrganizationDiv.html'));
const orgServicesDiv = bodyContent(path.join(componentsDir, 'orgServTemplate-body-OrgServicesDiv.html'));
const servDivSpreadsheet = blockScopeScripts(bodyContent(path.join(componentsDir, 'orgServTemplate-body-ServiceDiv-Spreadsheet.html')));
const servDivOrganization = blockScopeScripts(bodyContent(path.join(componentsDir, 'orgServTemplate-body-ServiceDiv-Organization.html')));

// Combine: insert head + component-specific styles into html, then insert body components into skeleton
const allComponentStyles = [
  'orgServTemplate-body-Header.html',
  'orgServTemplate-navBar.html',
  'orgServTemplate-body-OrganizationDiv.html',
  'orgServTemplate-body-ServiceDiv-Spreadsheet.html',
  'orgServTemplate-body-ServiceDiv-Organization.html',
].map(f => componentStyles(path.join(componentsDir, f))).filter(s => s).join('\n');

let combined = html.replace('</html>', head + '\n' + allComponentStyles + '\n' + bodySkeleton + '\n</html>');

// Wrap navbar + org content in flex container that gets toggled
const orgWrapper = `<div id="organizationWrapper" style="display: flex;">
<nav class="app-components-edit-EditSidebar-module__sidebar--npORK collapsed" id="sidebar">
${navBar.replace('<nav class="app-components-edit-EditSidebar-module__sidebar--npORK" id="sidebar">', '').replace('</nav>', '')}
</nav>
<div style="flex: 1;">
${orgDiv}
${orgServicesDiv}
</div>
</div>`;

// Insert the body components where the edit--main div content should go
const bodyComponents = timePicker + '\n' + header + '\n' + orgWrapper + '\n' + servDivSpreadsheet + '\n' + '<div id="serviceDivOrgTemplate" style="display:none;">' + servDivOrganization + '</div>';
combined = combined.replace(
  /<div class="edit--main">[\s\S]*?<\/div>\s*<!-+\s*EDIT MAIN START/,
  `<div class="edit--main">\n${bodyComponents}\n              </div>\n<!-------------- EDIT MAIN START`
);

// Write the combined file
fs.writeFileSync(outputFile, combined, 'utf8');
console.log(`✓ Combined template created: ${outputFile}`);

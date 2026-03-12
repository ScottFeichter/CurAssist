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

// Read all component files
const timePicker = fs.readFileSync(path.join(componentsDir, '_timePicker.html'), 'utf8');
const sharedServiceData = fs.readFileSync(path.join(componentsDir, '_sharedServiceData.html'), 'utf8');
const html = fs.readFileSync(path.join(componentsDir, 'orgServTemplate-html.html'), 'utf8');
const head = fs.readFileSync(path.join(componentsDir, 'orgServTemplate-head.html'), 'utf8');
const bodySkeleton = fs.readFileSync(path.join(componentsDir, 'orgServTemplate-body-skeleton.html'), 'utf8');
const header = fs.readFileSync(path.join(componentsDir, 'orgServTemplate-body-Header.html'), 'utf8');
const navBar = fs.readFileSync(path.join(componentsDir, 'orgServTemplate-navBar.html'), 'utf8');
const orgDiv = fs.readFileSync(path.join(componentsDir, 'orgServTemplate-body-OrganizationDiv.html'), 'utf8');
const orgServicesDiv = fs.readFileSync(path.join(componentsDir, 'orgServTemplate-body-OrgServicesDiv.html'), 'utf8');
const servDivSpreadsheet = fs.readFileSync(path.join(componentsDir, 'orgServTemplate-body-ServiceDiv-Spreadsheet.html'), 'utf8');
const servDivOrganization = fs.readFileSync(path.join(componentsDir, 'orgServTemplate-body-ServiceDiv-Organization.html'), 'utf8');

// Combine: insert head into html, then insert body components into skeleton
let combined = html.replace('</html>', head + bodySkeleton + '\n</html>');

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
const bodyComponents = timePicker + '\n' + sharedServiceData + '\n' + header + '\n' + orgWrapper + '\n' + servDivSpreadsheet + '\n' + '<div id="serviceDivOrgTemplate" style="display:none;">' + servDivOrganization + '</div>';
combined = combined.replace(
  /<div class="edit--main">[\s\S]*?<\/div>\s*<!-+\s*EDIT MAIN START/,
  `<div class="edit--main">\n${bodyComponents}\n              </div>\n<!-------------- EDIT MAIN START`
);

// Write the combined file
fs.writeFileSync(outputFile, combined, 'utf8');
console.log(`✓ Combined template created: ${outputFile}`);

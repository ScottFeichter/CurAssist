#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function getRelativePath(from, to) {
  const relative = path.relative(path.dirname(from), to);
  return relative.startsWith('.') ? relative : './' + relative;
}

function convertAliasToRelative(filePath, importPath) {
  // Remove @/ prefix
  const withoutAlias = importPath.replace(/^@\//, '');
  // Resolve to absolute path
  const srcDir = path.join(__dirname, 'src');
  const targetPath = path.join(srcDir, withoutAlias);
  // Get relative path
  return getRelativePath(filePath, targetPath);
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  
  // Match import/require statements with @/ aliases
  const importRegex = /(import\s+.*?from\s+['"])@\/(.*?)(['"])/g;
  const requireRegex = /(require\s*\(\s*['"])@\/(.*?)(['"])/g;
  
  content = content.replace(importRegex, (match, prefix, importPath, suffix) => {
    modified = true;
    const relativePath = convertAliasToRelative(filePath, importPath);
    return `${prefix}${relativePath}${suffix}`;
  });
  
  content = content.replace(requireRegex, (match, prefix, importPath, suffix) => {
    modified = true;
    const relativePath = convertAliasToRelative(filePath, importPath);
    return `${prefix}${relativePath}${suffix}`;
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✓ Converted: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.js')) {
      processFile(filePath);
    }
  }
}

console.log('Converting @ aliases to relative paths...\n');
walkDir(path.join(__dirname, 'src'));
console.log('\n✅ Conversion complete!');

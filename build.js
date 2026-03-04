#!/usr/bin/env node
/**
 * Build script — Combines HTML partials into index.html
 * Zero dependencies, only uses Node.js built-in 'fs' and 'path'.
 *
 * Usage: node build.js
 */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'src');
const SECTIONS_DIR = path.join(SRC, 'sections');
const OUTPUT = path.join(__dirname, 'index.html');

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

// 1. Structural partials (order matters)
const parts = [
  read(path.join(SRC, 'head.html')),
  read(path.join(SRC, 'header.html')),
  read(path.join(SRC, 'sidebar.html')),
  read(path.join(SRC, 'main-open.html')),
];

// 2. Section files — sorted by filename (01-xxx, 02-xxx, …)
const sectionFiles = fs.readdirSync(SECTIONS_DIR)
  .filter(f => f.endsWith('.html'))
  .sort();

for (const file of sectionFiles) {
  parts.push(read(path.join(SECTIONS_DIR, file)));
}

// 3. Footer
parts.push(read(path.join(SRC, 'footer.html')));

// 4. Combine and write
const output = parts.join('\n');
fs.writeFileSync(OUTPUT, output);

console.log(`Built index.html (${output.split('\n').length} lines, ${sectionFiles.length} sections)`);

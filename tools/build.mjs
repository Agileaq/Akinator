import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const SOURCES = [
  'js/data/characters.js',
  'js/engine.js',
  'js/storage.js',
  'js/app.js',
];

function stripModuleSyntax(code) {
  return code
    .replace(/^\s*import[\s\S]*?from\s+['"][^'"]+['"];?[ \t]*$/gm, '')
    .replace(/^export\s+/gm, '');
}

export function buildBundle() {
  const parts = SOURCES.map((rel) => {
    const code = readFileSync(join(root, rel), 'utf8');
    return `// ${rel}\n${stripModuleSyntax(code).trim()}`;
  });
  return `(function () {\n'use strict';\n\n${parts.join('\n\n')}\n})();\n`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const out = buildBundle();
  writeFileSync(join(root, 'js/bundle.js'), out);
  console.log(`wrote js/bundle.js (${out.length} bytes)`);
}

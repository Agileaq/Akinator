import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildBundle } from '../tools/build.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

test('committed js/bundle.js matches the generator output', () => {
  const onDisk = readFileSync(join(root, 'js/bundle.js'), 'utf8');
  assert.equal(onDisk, buildBundle());
});

test('bundle contains no module syntax and includes the app code', () => {
  const bundle = readFileSync(join(root, 'js/bundle.js'), 'utf8');
  assert.ok(!/^\s*import\s/m.test(bundle), 'bundle must not contain import statements');
  assert.ok(!/^export\s/m.test(bundle), 'bundle must not contain export statements');
  assert.ok(bundle.includes('function initGame'), 'engine must be included');
  assert.ok(bundle.includes('function render'), 'app must be included');
  assert.ok(bundle.includes('const ATTRIBUTES'), 'data must be included');
});

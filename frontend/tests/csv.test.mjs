import assert from 'node:assert/strict';
import test from 'node:test';
import { csvText } from '../lib/csv.ts';

test('CSV preserves multiline text, delimiters and quotes', () => {
  assert.equal(csvText([['A;B', '"C"', 'linha\nseguinte', null]]), '\uFEFF"A;B";"""C""";"linha\nseguinte";""');
});
test('spreadsheet formula text is neutralized while negative numeric values stay numeric', () => {
  assert.equal(csvText([['=1+1', ' @SUM(A1)', '-10', -10]]), '\uFEFF"\'=1+1";"\' @SUM(A1)";"\'-10";"-10"');
});

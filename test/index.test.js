import test from 'ava';
import fs from 'fs';
import AtomDocDocument from '../src/lib/';

test('should parse and inspect content', t => {
  const content = fs.readFileSync('./fixtures/multiple_functions.js', 'utf-8');
  const expected = fs.readFileSync('./expected/process.json', 'utf-8');
  const doc = new AtomDocDocument(content);
  return doc.process().then(result => {
    t.deepEqual(JSON.parse(expected), result);
  }).catch(t.fail);
});

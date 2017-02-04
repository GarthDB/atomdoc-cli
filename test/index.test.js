import test from 'ava';
import fs from 'fs';
import AtomDocDocument from '../src/lib/';

test('should parse and inspect content', t => {
  const content = fs.readFileSync('./test/fixtures/multiple_functions.js', 'utf-8');
  const expected = fs.readFileSync('./test/expected/process.json', 'utf-8');
  const doc = new AtomDocDocument(content);
  return doc.process().then(result => {
    t.notDeepEqual(JSON.parse(expected), result);
  }).catch(t.fail);
});

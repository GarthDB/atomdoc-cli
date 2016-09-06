import test from 'ava';
import fs from 'fs';
import AtomDocDocument from '../src/lib/';

test('should parse a file correctly', t => {
  const doc = new AtomDocDocument('./fixtures/basic_function.js');
  const expected = JSON.parse(fs.readFileSync('./expected/basic_function.json', 'utf-8'));
  return doc.parse().then(result => {
    t.deepEqual(expected, result.docs);
  }).catch(t.fail);
});

test('should ignore non atomdoc comments', t => {
  const doc = new AtomDocDocument('./fixtures/has_comment.js');
  const expected = fs.readFileSync('./expected/has_comment.json', 'utf-8').trim();
  return doc.parse().then(result => {
    t.deepEqual(expected, result.toString());
  }).catch(t.fail);
});

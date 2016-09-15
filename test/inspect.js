import test from 'ava';
import fs from 'fs';
import AtomDocDocument from '../src/lib/';

test('should inspect a file correctly', t => {
  const doc = new AtomDocDocument('./fixtures/basic_function.js');
  const expected = [{
    type: 'FunctionDeclaration',
    name: '_isAtruleDescendant',
    parentClass: false,
    start: 426,
    end: 687,
    args: [{name: 'node', optional: false}],
    returns: [{
      start: 668,
      end: 685,
      name: 'descended',
    }],
  }];
  return doc.inspect().then(result => {
    t.deepEqual(expected, result);
  }).catch(t.fail);
});

test('full instpection test', t => {
  const doc = new AtomDocDocument('./fixtures/inspection_test.js');
  const expected = JSON.parse(fs.readFileSync('./expected/inspection_test.json', 'utf-8'));
  return doc.inspect().then(result => {
    t.deepEqual(expected, result);
  }).catch(t.fail);
});

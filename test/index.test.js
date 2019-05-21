const test = require('ava');
const fs = require('fs');
const AtomDocDocument = require('../lib/');

function _stripTypes(result) {
  return JSON.parse(JSON.stringify(result, null, 2));
}

test('should parse and inspect basic content', t => {
  const content = fs.readFileSync(
    './test/fixtures/multiple_functions.js',
    'utf-8'
  );
  const expected = fs.readFileSync('./test/expected/process.json', 'utf-8');
  const doc = new AtomDocDocument(content);
  return doc
    .process()
    .then(result => {
      t.deepEqual(JSON.parse(expected), _stripTypes(result));
    })
    .catch(t.fail);
});

import test from 'ava';
import fs from 'fs';
import falafel from 'falafel';
import ContentInspector from '../src/lib/content_inspector';

function inspect(filepath) {
  const content = fs.readFileSync(filepath, 'utf-8');
  const contentInspector = new ContentInspector(content);
  falafel(content, {
    sourceType: 'module',
    ecmaVersion: '6',
    locations: true,
  }, (node) => {
    contentInspector.inspectNode(node);
  });
  return contentInspector.promise;
}

test('should inspect a file correctly', t => {
  const expected = [{
    type: 'FunctionDeclaration',
    name: '_isAtruleDescendant',
    className: false,
    start: 426,
    end: 687,
    definitionLine: 16,
    args: [{ name: 'node', optional: false }],
    returns: [{
      start: 668,
      end: 685,
      name: 'descended',
    }],
  }];
  return inspect('./fixtures/basic_function.js').then(result => {
    t.deepEqual(expected, result);
  }).catch(t.fail);
});

test('full inspection test', t => {
  inspect('./fixtures/inspection_test.js');
  const expected = JSON.parse(fs.readFileSync('./expected/inspection_test.json', 'utf-8'));
  return inspect('./fixtures/inspection_test.js').then(result => {
    t.deepEqual(expected, result);
  }).catch(t.fail);
});

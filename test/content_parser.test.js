const test = require('ava');
const fs = require('fs');
const falafel = require('falafel');
const ContentParser = require('../lib/content_parser');
const CommentParser = require('../lib/comment_parser');

function _stripTypes(result) {
  return JSON.parse(JSON.stringify(result, null, 2));
}

function parse(filepath) {
  const content = fs.readFileSync(filepath, 'utf-8');
  const commentParser = new CommentParser();
  const contentParser = new ContentParser(content, commentParser);
  falafel(
    content,
    {
      sourceType: 'module',
      ecmaVersion: '6',
      onComment: commentParser.parseComment.bind(commentParser),
      locations: true,
    },
    node => {
      contentParser.parseNode(node);
    }
  );
  return contentParser.promise;
}

test('should parse a file correctly', t => {
  const expected = JSON.parse(
    fs.readFileSync('./test/expected/basic_function.json', 'utf-8')
  );
  return parse('./test/fixtures/basic_function.js')
    .then(result => {
      t.deepEqual(expected, _stripTypes(result));
    })
    .catch(t.fail);
});

test('should ignore non atomdoc comments', t => {
  const expected = JSON.parse(
    fs.readFileSync('./test/expected/has_comment.json', 'utf-8')
  );
  return parse('./test/fixtures/has_comment.js')
    .then(result => {
      t.deepEqual(expected, _stripTypes(result));
    })
    .catch(t.fail);
});

test('should support non astricks block comment', t => {
  const expected = JSON.parse(
    fs.readFileSync('./test/expected/different_comment.json', 'utf-8')
  );
  return parse('./test/fixtures/different_comment.js')
    .then(result => {
      t.deepEqual(expected, _stripTypes(result));
    })
    .catch(t.fail);
});

test('should support arrow functions', t => {
  const expected = JSON.parse(
    fs.readFileSync('./test/expected/arrow_function.json', 'utf-8')
  );
  return parse('./test/fixtures/arrow_function.js')
    .then(result => {
      t.deepEqual(expected, _stripTypes(result));
    })
    .catch(t.fail);
});

test('should support class functions', t => {
  const expected = JSON.parse(
    fs.readFileSync('./test/expected/has_comment.json', 'utf-8')
  );
  return parse('./test/fixtures/class.js')
    .then(result => {
      result[0].start = 0;
      result[0].end = 132;
      result[0].definitionLine = 8;
      result[0].className = false;
      t.deepEqual(expected, _stripTypes(result));
    })
    .catch(t.fail);
});

test('should capture class name', t =>
  parse('./test/fixtures/class.js')
    .then(result => {
      t.is('Container', result[0].className);
    })
    .catch(t.fail));

test('should support anon arrow functions', t => {
  const expected = JSON.parse(
    fs.readFileSync('./test/expected/anon_comment.json', 'utf-8')
  );
  return parse('./test/fixtures/anon_arrow_function.js')
    .then(result => {
      result[0].start = 0;
      result[0].end = 132;
      t.deepEqual(expected, _stripTypes(result));
    })
    .catch(t.fail);
});

test('should support multiple functions', t => {
  const expected = JSON.parse(
    fs.readFileSync('./test/expected/multiple_functions.json', 'utf-8')
  );
  return parse('./test/fixtures/multiple_functions.js')
    .then(result => {
      t.deepEqual(expected, _stripTypes(result));
    })
    .catch(t.fail);
});

test('should support object property functions', t => {
  const expected = JSON.parse(
    fs.readFileSync('./test/expected/object_property.json', 'utf-8')
  );
  return parse('./test/fixtures/object_property.js')
    .then(result => {
      t.deepEqual(expected, _stripTypes(result));
    })
    .catch(t.fail);
});

test('correctly handle nested functions', t => {
  const expected = JSON.parse(
    fs.readFileSync('./test/expected/nested_functions.json', 'utf-8')
  );
  return parse('./test/fixtures/nested_functions.js')
    .then(result => {
      t.deepEqual(expected, _stripTypes(result));
    })
    .catch(t.fail);
});

test('correctly object parameters with children', t => {
  const expected = JSON.parse(
    fs.readFileSync(
      './test/expected/param-context-matching-inspection.json',
      'utf-8'
    )
  );
  return parse('./test/fixtures/param-context-matching.js')
    .then(result => {
      t.deepEqual(expected, _stripTypes(result));
    })
    .catch(t.fail);
});

import test from 'ava';
import fs from 'fs';
import falafel from 'falafel';
import ContentParser from '../src/lib/content_parser';
import CommentParser from '../src/lib/comment_parser';

function parse(filepath) {
  const content = fs.readFileSync(filepath, 'utf-8');
  const commentParser = new CommentParser();
  const contentParser = new ContentParser(content, commentParser);
  return new Promise(resolve => {
    falafel(content, {
      sourceType: 'module',
      ecmaVersion: '6',
      onComment: commentParser.parseComment.bind(commentParser),
    }, (node) => {
      contentParser.parseNode(node, resolve);
    });
  });
}

test('should parse a file correctly', t => {
  const expected = JSON.parse(fs.readFileSync('./expected/basic_function.json', 'utf-8'));
  return parse('./fixtures/basic_function.js').then(result => {
    t.deepEqual(expected, result.docs);
  }).catch(t.fail);
});

test('should ignore non atomdoc comments', t => {
  const expected = fs.readFileSync('./expected/has_comment.json', 'utf-8').trim();
  return parse('./fixtures/has_comment.js').then(result => {
    t.deepEqual(expected, result.toString());
  }).catch(t.fail);
});

test('should support non astricks block comment', t => {
  const expected = fs.readFileSync('./expected/has_comment.json', 'utf-8').trim();
  return parse('./fixtures/different_comment.js').then(result => {
    result.docs[0].end = 132;
    t.deepEqual(expected, result.toString());
  }).catch(t.fail);
});

test('should support arrow functions', t => {
  const expected = fs.readFileSync('./expected/has_comment.json', 'utf-8').trim();
  return parse('./fixtures/arrow_function.js').then(result => {
    result.docs[0].start = 0;
    result.docs[0].end = 132;
    t.deepEqual(expected, result.toString());
  }).catch(t.fail);
});

test('should support class functions', t => {
  const expected = fs.readFileSync('./expected/has_comment.json', 'utf-8').trim();
  return parse('./fixtures/class.js').then(result => {
    result.docs[0].start = 0;
    result.docs[0].end = 132;
    delete result.docs[0].className;
    t.deepEqual(expected, result.toString());
  }).catch(t.fail);
});

test('should capture class name', t =>
  parse('./fixtures/class.js').then(result => {
    t.deepEqual('Container', result.docs[0].className);
  }).catch(t.fail)
);

test('should support anon arrow functions', t => {
  const expected = fs.readFileSync('./expected/anon_comment.json', 'utf-8').trim();
  return parse('./fixtures/anon_arrow_function.js').then(result => {
    result.docs[0].start = 0;
    result.docs[0].end = 132;
    t.deepEqual(expected, result.toString());
  }).catch(t.fail);
});


test('should support multiple functions', t => {
  const expected = fs.readFileSync('./expected/multiple_functions.json', 'utf-8').trim();
  return parse('./fixtures/multiple_functions.js').then(result => {
    t.deepEqual(expected, result.toString());
  }).catch(t.fail);
});

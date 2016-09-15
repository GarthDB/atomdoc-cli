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

test('should support non astricks block comment', t => {
  const doc = new AtomDocDocument('./fixtures/different_comment.js');
  const expected = fs.readFileSync('./expected/has_comment.json', 'utf-8').trim();
  return doc.parse().then(result => {
    result.docs[0].end = 132;
    t.deepEqual(expected, result.toString());
  }).catch(t.fail);
});

test('should support arrow functions', t => {
  const doc = new AtomDocDocument('./fixtures/arrow_function.js');
  const expected = fs.readFileSync('./expected/has_comment.json', 'utf-8').trim();
  return doc.parse().then(result => {
    result.docs[0].start = 0;
    result.docs[0].end = 132;
    t.deepEqual(expected, result.toString());
  }).catch(t.fail);
});

test('should support class functions', t => {
  const doc = new AtomDocDocument('./fixtures/class.js');
  const expected = fs.readFileSync('./expected/has_comment.json', 'utf-8').trim();
  return doc.parse().then(result => {
    result.docs[0].start = 0;
    result.docs[0].end = 132;
    delete result.docs[0].className;
    t.deepEqual(expected, result.toString());
  }).catch(t.fail);
});

test('should capture class name', t => {
  const doc = new AtomDocDocument('./fixtures/class.js');
  return doc.parse().then(result => {
    t.deepEqual('Container', result.docs[0].className);
  }).catch(t.fail);
});

test('should support anon arrow functions', t => {
  const doc = new AtomDocDocument('./fixtures/anon_arrow_function.js');
  const expected = fs.readFileSync('./expected/anon_comment.json', 'utf-8').trim();
  return doc.parse().then(result => {
    result.docs[0].start = 0;
    result.docs[0].end = 132;
    t.deepEqual(expected, result.toString());
  }).catch(t.fail);
});


test('should support multiple functions', t => {
  const doc = new AtomDocDocument('./fixtures/multiple_functions.js');
  const expected = fs.readFileSync('./expected/multiple_functions.json', 'utf-8').trim();
  return doc.parse().then(result => {
    t.deepEqual(expected, result.toString());
  }).catch((err) => {
    console.log(err);
    t.fail;
  });
});

import test from 'ava';
import fs from 'fs';
import Comparer, { MethodReport, Comparison } from '../src/lib/comparer';
import AtomDocDocument from '../src/lib/';

test("should report when docs don't exist", t => {
  const content = fs.readFileSync('./test/fixtures/multiple_functions.js', 'utf-8');
  const doc = new AtomDocDocument(content);
  return doc.process().then(result => {
    const methodReport = new MethodReport(undefined, result.inspectorResult[0]);
    t.false(methodReport.validDocs);
  });
});

test('should report when docs exist', t => {
  const content = fs.readFileSync('./test/fixtures/multiple_functions.js', 'utf-8');
  const doc = new AtomDocDocument(content);
  return doc.process().then(result => {
    const atomDoc = result.findAtomDoc(result.inspectorResult[0].definitionLine);
    const methodReport = new MethodReport(atomDoc, result.inspectorResult[0]);
    t.true(methodReport.validDocs);
  });
});

test("should report when method and AtomDoc method names don't match", t => {
  const content = fs.readFileSync('./test/fixtures/multiple_functions.js', 'utf-8');
  const doc = new AtomDocDocument(content);
  return doc.process().then(result => {
    const atomDoc = result.findAtomDoc(result.inspectorResult[0].definitionLine);
    atomDoc.name = 'incorrectName';
    const methodReport = new MethodReport(atomDoc, result.inspectorResult[0]);
    const expected = new Comparison('name', 'incorrectName', '_getNodeType');
    t.deepEqual(methodReport.nameMatch, expected);
  });
});

test('should report when method and AtomDoc method names match', t => {
  const content = fs.readFileSync('./test/fixtures/multiple_functions.js', 'utf-8');
  const doc = new AtomDocDocument(content);
  return doc.process().then(result => {
    const atomDoc = result.findAtomDoc(result.inspectorResult[0].definitionLine);
    const methodReport = new MethodReport(atomDoc, result.inspectorResult[0]);
    const expected = new Comparison('name', '_getNodeType', '_getNodeType');
    t.deepEqual(methodReport.nameMatch, expected);
  });
});

test('should report visibility when private', t => {
  const content = fs.readFileSync('./test/fixtures/multiple_functions.js', 'utf-8');
  const doc = new AtomDocDocument(content);
  return doc.process().then(result => {
    const atomDoc = result.findAtomDoc(result.inspectorResult[0].definitionLine);
    const methodReport = new MethodReport(atomDoc, result.inspectorResult[0]);
    t.is(methodReport.visibility, 'Private');
  });
});

test('should report visibility when public', t => {
  const content = fs.readFileSync('./test/fixtures/basic_reporter.js', 'utf-8');
  const doc = new AtomDocDocument(content);
  return doc.process().then(result => {
    const atomDoc = result.findAtomDoc(result.inspectorResult[0].definitionLine);
    const methodReport = new MethodReport(atomDoc, result.inspectorResult[0]);
    t.is(methodReport.visibility, 'Public');
  });
});

test("should report examples don't exist", t => {
  const content = fs.readFileSync('./test/fixtures/basic_reporter.js', 'utf-8');
  const doc = new AtomDocDocument(content);
  return doc.process().then(result => {
    const atomDoc = result.findAtomDoc(result.inspectorResult[0].definitionLine);
    const methodReport = new MethodReport(atomDoc, result.inspectorResult[0]);
    t.false(methodReport.examplesExist);
  });
});

test('should report examples exist', t => {
  const content = fs.readFileSync('./test/fixtures/basic_reporter.js', 'utf-8');
  const doc = new AtomDocDocument(content);
  return doc.process().then(result => {
    const atomDoc = result.findAtomDoc(result.inspectorResult[2].definitionLine);
    const methodReport = new MethodReport(atomDoc, result.inspectorResult[2]);
    t.true(methodReport.examplesExist);
  });
});

test("should report when class names don't match", t => {
  const content = fs.readFileSync('./test/fixtures/basic_reporter.js', 'utf-8');
  const doc = new AtomDocDocument(content);
  return doc.process().then(result => {
    const atomDoc = result.findAtomDoc(result.inspectorResult[2].definitionLine);
    atomDoc.className = 'incorrectName';
    const methodReport = new MethodReport(atomDoc, result.inspectorResult[2]);
    const expected = new Comparison('className', 'incorrectName', 'Poop');
    t.deepEqual(methodReport.classNameMatch, expected);
  });
});

test('should report when class names match', t => {
  const content = fs.readFileSync('./test/fixtures/basic_reporter.js', 'utf-8');
  const doc = new AtomDocDocument(content);
  return doc.process().then(result => {
    const atomDoc = result.findAtomDoc(result.inspectorResult[2].definitionLine);
    const methodReport = new MethodReport(atomDoc, result.inspectorResult[2]);
    const expected = new Comparison('className', 'Poop', 'Poop');
    t.deepEqual(methodReport.classNameMatch, expected);
  });
});

test("should report when nested params don't match names with doc", t => {
  const content = fs.readFileSync('./test/fixtures/param-context-matching.js', 'utf-8');
  const doc = new AtomDocDocument(content);
  return doc.process().then(result => {
    const atomDoc = result.findAtomDoc(result.inspectorResult[1].definitionLine);
    const methodReport = new MethodReport(atomDoc, result.inspectorResult[1]);
    t.false(methodReport.valid);
  });
});

test("should report when nested params don't match optional with doc", t => {
  const content = fs.readFileSync('./test/fixtures/param-context-matching.js', 'utf-8');
  const doc = new AtomDocDocument(content);
  return doc.process().then(result => {
    const atomDoc = result.findAtomDoc(result.inspectorResult[2].definitionLine);
    const methodReport = new MethodReport(atomDoc, result.inspectorResult[2]);
    t.false(methodReport.valid);
  });
});

test('should provide a comparer result for each method', t => {
  const content = fs.readFileSync('./test/fixtures/param-context-matching.js', 'utf-8');
  const doc = new AtomDocDocument(content);
  return doc.process().then(result => {
    const comparer = new Comparer(result);
    t.false(comparer.valid);
  });
});

import test from 'ava';
import fs from 'fs';
import Comparer, { MethodReport } from '../src/lib/comparer';
import AtomDocDocument from '../src/lib/';

let _fixture;

test.beforeEach(() => {
  const content = fs.readFileSync('./test/fixtures/multiple_functions.js', 'utf-8');
  const doc = new AtomDocDocument(content);
  return doc.process().then(result => {
    _fixture = result;
  });
});

test("should report when docs don't exist", t => {
  const fixture = _fixture;
  const methodReport = new MethodReport(undefined, fixture.inspectorResult[0]);
  t.false(methodReport.validDocs);
});

test('should report when docs exist', t => {
  const fixture = _fixture;
  const atomDoc = fixture.findAtomDoc(fixture.inspectorResult[0].definitionLine);
  const methodReport = new MethodReport(atomDoc, fixture.inspectorResult[0]);
  t.true(methodReport.validDocs);
});

test("should report when method and AtomDoc method names don't match", t => {
  const fixture = _fixture;
  const atomDoc = Object.assign({}, fixture.findAtomDoc(fixture.inspectorResult[0].definitionLine));
  atomDoc.name = 'incorrectName';
  const methodReport = new MethodReport(atomDoc, fixture.inspectorResult[0]);
  t.false(methodReport.nameMatch.valid);
});

test('should report when method and AtomDoc method names match', t => {
  const fixture = _fixture;
  const atomDoc = Object.assign({}, fixture.findAtomDoc(fixture.inspectorResult[0].definitionLine));
  const methodReport = new MethodReport(atomDoc, fixture.inspectorResult[0]);
  t.true(methodReport.nameMatch.valid);
});

test('should report when examples required and present', t => {
  const fixture = _fixture;
  const atomDoc = Object.assign({}, fixture.findAtomDoc(fixture.inspectorResult[2].definitionLine));
  const methodReport = new MethodReport(atomDoc, fixture.inspectorResult[2]);
  t.true(methodReport.validExamples.valid);
});

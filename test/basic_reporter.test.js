/* eslint-disable import/no-extraneous-dependencies */
import test from 'ava';
import fs from 'fs';
import basicReporter from '../src/lib/basic_reporter';
import AtomDocDocument from '../src/lib/';
import Comparison from '../src/lib/comparison';

test('should return basic report', t => {
  const content = fs.readFileSync('./test/fixtures/basic_reporter.js', 'utf-8');
  const doc = new AtomDocDocument(content);
  return doc.process().then(result => {
    const comparison = new Comparison(result);
    const basic = basicReporter(comparison, './test/fixtures/basic_reporter.js');
    const expected = fs.readFileSync('./test/expected/basic_reporter.txt', 'utf-8');
    t.deepEqual(basic, expected);
  });
});

// test.cb('should return basic report', t => {
//   nixt()
//   .expect((result) => {
//     const expected = read('./test/expected/basic_reporter.txt');
//     t.is(result.stdout.trim(), expected);
//   })
//   .run('atomdoc ./test/fixtures/basic_reporter.js')
//   .end(t.end);
// });
//
// test.cb('should return verbose report', t => {
//   nixt()
//   .expect((result) => {
//     const expected = read('./test/expected/basic_reporter.verbose.txt');
//     t.is(result.stdout.trim(), expected);
//   })
//   .run('atomdoc -v ./test/fixtures/basic_reporter.js')
//   .end(t.end);
// });
//
// test.cb('should return code 0 when errors exist', t => {
//   nixt()
//   .expect((result) => {
//     t.is(result.code, 1);
//   })
//   .run('atomdoc ./test/fixtures/basic_reporter.js')
//   .end(t.end);
// });
//
// test.cb('should return code 1 when no errors exist', t => {
//   nixt()
//   .expect((result) => {
//     t.is(result.code, 0);
//   })
//   .run('atomdoc ./test/fixtures/basic_function.js')
//   .end(t.end);
// });
//
// test.cb('should return no error message when no errors', t => {
//   nixt()
//   .expect((result) => {
//     t.is(result.stdout, 'No missing AtomDocs in ./test/fixtures/basic_function.js\n');
//   })
//   .run('atomdoc ./test/fixtures/basic_function.js')
//   .end(t.end);
// });
//
// test.cb('should run atomdoc on js files in directory', t => {
//   nixt()
//   .expect((result) => {
//     const expected = read('./test/expected/directory_report.txt');
//     t.is(result.stdout.trim(), expected);
//   })
//   .run('atomdoc ./test/fixtures/directory')
//   .end(t.end);
// });
//
// test.cb('should compare nested parameters', t => {
//   nixt()
//   .expect((result) => {
//     const expected = read('./test/expected/directory_report.txt');
//     t.is(result.stdout.trim(), expected);
//   })
//   .run('atomdoc ./test/fixtures/param-context-matching.js')
//   .end(t.end);
// });

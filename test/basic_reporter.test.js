/* eslint-disable import/no-extraneous-dependencies */
import test from 'ava';
import fs from 'fs';
import nixt from 'nixt';

function read(filepath) {
  return fs.readFileSync(filepath, 'utf-8').trim();
}

test.cb('should return basic report', t => {
  nixt()
  .expect((result) => {
    const expected = read('./expected/basic_reporter.txt');
    t.is(result.stdout.trim(), expected);
  })
  .run('atomdoc ./fixtures/basic_reporter.js')
  .end(t.end);
});

test.cb('should return verbose report', t => {
  nixt()
  .expect((result) => {
    const expected = read('./expected/basic_reporter.verbose.txt');
    t.is(result.stdout.trim(), expected);
  })
  .run('atomdoc -v ./fixtures/basic_reporter.js')
  .end(t.end);
});

test.cb('should return code 0 when errors exist', t => {
  nixt()
  .expect((result) => {
    t.is(result.code, 1);
  })
  .run('atomdoc ./fixtures/basic_reporter.js')
  .end(t.end);
});

test.cb('should return code 1 when no errors exist', t => {
  nixt()
  .expect((result) => {
    t.is(result.code, 0);
  })
  .run('atomdoc ./fixtures/basic_function.js')
  .end(t.end);
});

test.cb('should return no error message when no errors', t => {
  nixt()
  .expect((result) => {
    t.is(result.stdout, 'No missing AtomDocs in ./fixtures/basic_function.js');
  })
  .run('atomdoc ./fixtures/basic_function.js')
  .end(t.end);
});

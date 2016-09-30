/* eslint-disable import/no-extraneous-dependencies */
import test from 'ava';
import fs from 'fs';
import nixt from 'nixt';
import pkginfo from 'pkginfo';

pkginfo(module, 'version');
function read(filepath) {
  return fs.readFileSync(filepath, 'utf-8').trim();
}

test.before(() => {
  try {
    fs.mkdirSync('./expected/tmp/');
  } catch (e) {
    //
  }
});
test.after.always('cleanup', () => {
  try {
    fs.unlinkSync('./expected/tmp/api.json');
    fs.rmdirSync('./expected/tmp/');
  } catch (e) {
    //
  }
});
test.cb('should display help', t => {
  nixt()
  .expect((result) => {
    t.true((result.stdout.trim().indexOf('Usage: atomdoc') >= 0));
  })
  .run('atomdoc --help')
  .end(t.end);
});
test.cb('should display version', t => {
  nixt()
  .expect((result) => {
    t.is(result.stdout.trim(), module.exports.version);
  })
  .run('atomdoc -V')
  .end(t.end);
});
test.cb('should generate correct output', t => {
  nixt()
  .expect((result) => {
    const expected = read('./expected/basic_function.json');
    t.is(result.stdout.trim(), expected);
  })
  .run('atomdoc --reporter false ./fixtures/basic_function.js')
  .end(t.end);
});
test.cb('should write json file', t => {
  nixt()
  .expect(() => {
    const expected = read('./expected/full_report.json');
    const output = read('./expected/tmp/api.json');
    t.is(output, expected);
  })
  .run('atomdoc -o ./expected/tmp/api.json ./fixtures/has_comment.js')
  .end(t.end);
});
test.cb('should error out if file doesn\'t exist', t => {
  nixt()
  .expect((result) => {
    const regex = /^Error: No files match 'nonexistent\.js'/;
    t.regex(result.stderr.trim(), regex);
  })
  .run('atomdoc nonexistent.js')
  .end(t.end);
});
test.cb('should use a custom reporter', t => {
  nixt()
  .expect((result) => {
    const expected = `${read('./expected/basic_function.json').trim()}\nfrom console reporter`;
    t.is(result.stdout.trim(), expected);
  })
  .run('atomdoc --reporter="./fixtures/console_reporter.js" ./fixtures/basic_function.js')
  .end(t.end);
});

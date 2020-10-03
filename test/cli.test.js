/* eslint-disable import/no-extraneous-dependencies */
const test = require('ava');
const fs = require('fs');
const nixt = require('nixt');
const pkginfo = require('pkginfo');

pkginfo(module, 'version');
function read(filepath) {
  return fs.readFileSync(filepath, 'utf-8').trim();
}

function _trimLines(text) {
  const lines = text.split('\n');
  const result = lines.map(line => line.trim());
  return result.join('\n');
}

test.before(() => {
  try {
    fs.mkdirSync('./test/expected/tmp/');
  } catch (e) {
    //
  }
});
test.after.always('cleanup', () => {
  try {
    fs.unlinkSync('./test/expected/tmp/api.json');
    fs.rmdirSync('./test/expected/tmp/');
  } catch (e) {
    //
  }
});
test.cb('should display help', t => {
  nixt()
    .expect(result => {
      t.true(result.stdout.trim().indexOf('Usage: atomdoc') >= 0);
    })
    .run('atomdoc --help')
    .end(t.end);
});
test.cb('should display version', t => {
  nixt()
    .expect(result => {
      t.is(result.stdout.trim(), module.exports.version);
    })
    .run('atomdoc -V')
    .end(t.end);
});
test.cb('should generate correct output', t => {
  nixt()
    .expect(result => {
      const expected = read('./test/expected/basic_function.json');
      t.is(result.stdout.trim(), expected);
    })
    .run('atomdoc --reporter false ./test/fixtures/basic_function.js')
    .end(t.end);
});
test.cb('should write json file', t => {
  nixt()
    .expect(() => {
      const expected = read('./test/expected/full_report.json');
      const output = read('./test/expected/tmp/api.json');
      t.is(output, expected);
    })
    .run(
      'atomdoc -o ./test/expected/tmp/api.json ./test/fixtures/has_comment.js'
    )
    .end(t.end);
});
test.cb("should error out if file doesn't exist", t => {
  nixt()
    .expect(result => {
      const regex = /^Error: No files match 'nonexistent\.js'/;
      t.regex(result.stderr.trim(), regex);
    })
    .run('atomdoc nonexistent.js')
    .end(t.end);
});
test.cb('should return code 1 when errors exist', t => {
  nixt()
    .expect(result => {
      t.is(result.code, 1);
    })
    .run('atomdoc ./test/fixtures/basic_reporter.js')
    .end(t.end);
});
test.cb('should return code 0 when no errors exist', t => {
  nixt()
    .expect(result => {
      t.is(result.code, 0);
    })
    .run('atomdoc ./test/fixtures/basic_function.js')
    .end(t.end);
});
test.cb('should return a cli verbose report', t => {
  nixt()
    .expect(result => {
      const expected = read('./test/expected/basic_reporter.verbose.txt');
      t.is(_trimLines(result.stdout.trim()), expected);
    })
    .run('atomdoc ./test/fixtures/basic_reporter.js --verbose')
    .end(t.end);
});
test.cb('should show a report when no docs present', t => {
  nixt()
    .expect(result => {
      const expected = read('./test/expected/no_docs.txt');
      t.is(_trimLines(result.stdout.trim()), expected);
    })
    .run('atomdoc ./test/fixtures/no_docs.js --verbose')
    .end(t.end);
});
test.cb('should use a custom reporter', t => {
  nixt()
    .expect(result => {
      const expected = `${read(
        './test/expected/basic_function.json'
      ).trim()}\nfrom console reporter`;
      t.is(result.stdout.trim(), expected);
    })
    .run(
      'atomdoc --reporter="./test/fixtures/console_reporter.js" ./test/fixtures/basic_function.js'
    )
    .end(t.end);
});

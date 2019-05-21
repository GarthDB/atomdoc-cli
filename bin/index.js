#!/usr/bin/env node
/* eslint-disable global-require */
const program = require('commander');
const pkginfo = require('pkginfo');
const resolve = require('resolve');
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const AtomDocDocument = require('../lib/');
const Comparison = require('../lib/comparison').Comparison;

pkginfo(module, 'version', 'description');

program
  .version(module.exports.version)
  .description(module.exports.description)
  .usage('<file>')
  .option(
    '-o, --output-path [filename]',
    'Where to write out, defaults to stdout if not specified.'
  )
  .option(
    '-r, --reporter [packagename]',
    'Path or package name of a reporter to use'
  )
  .option(
    '-v, --verbose',
    'Show full report, without it, this tool will only show errors'
  )
  .parse(process.argv);

let reporter;
let pattern = program.args[0];
if (program.reporter === 'false') {
  /**
   *  Private: a basic reporter function that just `console.log`s out a JSON version
   *  of the parserResult.
   *
   * * `comparison` {Comparison} with the full comparison result.
   */
  reporter = comparison =>
    JSON.stringify(comparison.result.parserResult, null, 2);
} else if (program.reporter) {
  const basedir = path.normalize(process.cwd());
  const reporterPath = resolve.sync(program.reporter, {basedir});
  reporter = require(reporterPath);
} else {
  reporter = require(resolve.sync('../lib/basic_reporter'));
}

try {
  const stats = fs.lstatSync(pattern);
  if (stats.isDirectory()) pattern = `${pattern}/**/*.js`;
} catch (err) {
  /* */
}
glob(pattern, {}, (er, files) => {
  if (files.length === 0) {
    console.error(new Error(`No files match '${pattern}'`));
    process.exit(1);
  }
  files.forEach(filepath => {
    const content = fs.readFileSync(filepath, 'utf-8');
    const doc = new AtomDocDocument(content);
    if (program.outputPath === true) program.outputPath = './api.json';
    const verbose = program.verbose || false;
    doc.process().then(result => {
      result.filename = filepath;
      if (program.outputPath) {
        fs.writeFileSync(
          program.outputPath,
          JSON.stringify(result, null, 2),
          'utf8'
        );
        console.log(`File ${program.outputPath} written.`);
      } else {
        const comparisonResult = new Comparison(result);
        const report = reporter(comparisonResult, filepath, verbose);
        console.log(report);
        if (!comparisonResult.valid) {
          process.exitCode = 1;
        }
      }
    });
  });
});

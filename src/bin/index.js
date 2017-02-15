#!/usr/bin/env node
/* eslint-disable global-require */
import program from 'commander';
import pkginfo from 'pkginfo';
import resolve from 'resolve';
import fs from 'fs';
import path from 'path';
import glob from 'glob';
import AtomDocDocument from '../lib/';
import Comparison from '../lib/comparison';

pkginfo(module, 'version', 'description');

program
  .version(module.exports.version)
  .description(module.exports.description)
  .usage('<file>')
  .option('-o, --output-path [filename]',
    'Where to write out, defaults to stdout if not specified.')
  .option('-r, --reporter [packagename]', 'Path or package name of a reporter to use')
  .option('-v, --verbose', 'Show full report, without it, this tool will only show errors')
  .parse(process.argv);

let reporter;
let pattern = program.args[0];
if (program.reporter === 'false') {
  /**
   *  Private: a basic reporter function that just `console.log`s out a JSON version
   *  of the parserResult.
   *
   * * `comparer` {Comparison} with the full comparison result.
   */
  reporter = (comparer) => {
    console.log(JSON.stringify(comparer.valid, null, 2));
  };
} else if (program.reporter) {
  const basedir = path.normalize(process.cwd());
  const reporterPath = resolve.sync(program.reporter, { basedir });
  reporter = require(reporterPath);
} else {
  reporter = require(resolve.sync('../lib/basic_reporter'));
}

try {
  const stats = fs.lstatSync(pattern);
  if (stats.isDirectory()) pattern = `${pattern}/**/*.js`;
} catch (err) { /* */ }

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
        fs.writeFileSync(program.outputPath, JSON.stringify(result, null, 2), 'utf8');
        console.log(`File ${program.outputPath} written.`);
      } else {
        reporter(new Comparison(result), verbose);
      }
    });
  });
});

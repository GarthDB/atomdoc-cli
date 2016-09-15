#!/usr/bin/env node
import program from 'commander';
import pkginfo from 'pkginfo';
import fs from 'fs';
import AtomDocDocument from '../lib/';
import basicReport from '../lib/basic_reporter';


pkginfo(module, 'version', 'description');

program
  .version(module.exports.version)
  .description(module.exports.description)
  .usage('<file>')
  .option('-o, --output-path [filename]',
    'Where to write out, defaults to stdout if not specified.')
  .parse(process.argv);

const doc = new AtomDocDocument(program.args[0]);

if (program.outputPath === true) program.outputPath = './api.json';

doc.parse().then(result => {
  if (program.outputPath) {
    fs.writeFileSync(program.outputPath, result.toString(), 'utf8');
    console.log(`File ${program.outputPath} written.`);
  } else {
    console.log(result.toString());
  }
}).catch(err => {
  console.log(err);
});

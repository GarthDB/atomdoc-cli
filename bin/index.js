#!/usr/bin/env node
'use strict';

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _pkginfo = require('pkginfo');

var _pkginfo2 = _interopRequireDefault(_pkginfo);

var _resolve = require('resolve');

var _resolve2 = _interopRequireDefault(_resolve);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _lib = require('../lib/');

var _lib2 = _interopRequireDefault(_lib);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _pkginfo2.default)(module, 'version', 'description');
/* eslint-disable global-require */


_commander2.default.version(module.exports.version).description(module.exports.description).usage('<file>').option('-o, --output-path [filename]', 'Where to write out, defaults to stdout if not specified.').option('-r, --reporter [packagename]', 'Path or package name of a reporter to use').option('-v, --verbose', 'Show full report, without it, this tool will only show errors').parse(process.argv);

var reporter = void 0;
var pattern = _commander2.default.args[0];
if (_commander2.default.reporter === 'false') {
  reporter = function reporter(result) {
    console.log(JSON.stringify(result.parserResult, null, 2));
  };
} else if (_commander2.default.reporter) {
  var basedir = _path2.default.normalize(process.cwd());
  var reporterPath = _resolve2.default.sync(_commander2.default.reporter, { basedir: basedir });
  reporter = require(reporterPath);
} else {
  reporter = require(_resolve2.default.sync('../lib/basic_reporter'));
}

try {
  var stats = _fs2.default.lstatSync(pattern);
  if (stats.isDirectory()) pattern = pattern + '/**/*.js';
} catch (err) {/* */}

(0, _glob2.default)(pattern, {}, function (er, files) {
  if (files.length === 0) {
    console.error(new Error('No files match \'' + pattern + '\''));
    process.exit(1);
  }
  files.forEach(function (filepath) {
    var content = _fs2.default.readFileSync(filepath, 'utf-8');
    var doc = new _lib2.default(content);
    if (_commander2.default.outputPath === true) _commander2.default.outputPath = './api.json';
    var verbose = _commander2.default.verbose || false;
    doc.process().then(function (result) {
      result.filename = filepath;
      if (_commander2.default.outputPath) {
        _fs2.default.writeFileSync(_commander2.default.outputPath, JSON.stringify(result.parserResult, null, 2), 'utf8');
        console.log('File ' + _commander2.default.outputPath + ' written.');
      } else {
        reporter(result, verbose);
      }
    });
  });
});
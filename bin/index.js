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

var _lib = require('../lib/');

var _lib2 = _interopRequireDefault(_lib);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable global-require */
(0, _pkginfo2.default)(module, 'version', 'description');

_commander2.default.version(module.exports.version).description(module.exports.description).usage('<file>').option('-o, --output-path [filename]', 'Where to write out, defaults to stdout if not specified.').option('-r, --reporter [packagename]', 'Path or package name of a reporter to use').parse(process.argv);

var content = void 0;
var reporter = void 0;
try {
  content = _fs2.default.readFileSync(_commander2.default.args[0], 'utf-8');
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
} catch (err) {
  console.log(err);
}
var doc = new _lib2.default(content);

if (_commander2.default.outputPath === true) _commander2.default.outputPath = './api.json';

doc.process().then(function (result) {
  if (_commander2.default.outputPath) {
    _fs2.default.writeFileSync(_commander2.default.outputPath, JSON.stringify(result.parserResult, null, 2), 'utf8');
    console.log('File ' + _commander2.default.outputPath + ' written.');
  } else {
    reporter(result);
  }
});
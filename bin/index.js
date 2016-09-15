#!/usr/bin/env node
'use strict';

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _pkginfo = require('pkginfo');

var _pkginfo2 = _interopRequireDefault(_pkginfo);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _lib = require('../lib/');

var _lib2 = _interopRequireDefault(_lib);

var _basic_reporter = require('../lib/basic_reporter');

var _basic_reporter2 = _interopRequireDefault(_basic_reporter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _pkginfo2.default)(module, 'version', 'description');

_commander2.default.version(module.exports.version).description(module.exports.description).usage('<file>').option('-o, --output-path [filename]', 'Where to write out, defaults to stdout if not specified.').parse(process.argv);

var doc = new _lib2.default(_commander2.default.args[0]);

if (_commander2.default.outputPath === true) _commander2.default.outputPath = './api.json';

doc.parse().then(function (result) {
  if (_commander2.default.outputPath) {
    _fs2.default.writeFileSync(_commander2.default.outputPath, result.toString(), 'utf8');
    console.log('File ' + _commander2.default.outputPath + ' written.');
  } else {
    console.log(result.toString());
  }
}).catch(function (err) {
  console.log(err);
});
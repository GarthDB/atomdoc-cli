'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fsReadfilePromise = require('fs-readfile-promise');

var _fsReadfilePromise2 = _interopRequireDefault(_fsReadfilePromise);

var _extractComments = require('extract-comments');

var _extractComments2 = _interopRequireDefault(_extractComments);

var _atomdoc = require('atomdoc');

var _atomdoc2 = _interopRequireDefault(_atomdoc);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 *  Private: adjusts contents of block comments so the base indent is 0.
 *
 *  * `str` {String} block comment.
 *
 *  Returns {String} adjusted content.
 */
var _fixIndent = function _fixIndent(str) {
  var indentRegEx = /^(\s)*/;
  var indent = str.match(indentRegEx)[0];
  if (indent !== '') {
    return str.replace(new RegExp(indent, ['g']), '\n').trim();
  }
  return str;
};

/**
 *  Result Class
 */

var Result = function () {
  /**
   *  Public: constructor for result instance.
   *
   *  * `atomDocs` {Array} of AtomDoc {Objects}
   */
  function Result(atomDocs) {
    _classCallCheck(this, Result);

    this.docs = atomDocs;
  }
  /**
   *  Public: converts atomdocs result to {String}
   *
   *  Returns ready to print {String}
   */


  _createClass(Result, [{
    key: 'toString',
    value: function toString() {
      return JSON.stringify(this.docs, null, 2);
    }
  }]);

  return Result;
}();

/**
 *  AtomDocDocument Class
 */


var AtomDocDocument = function () {
  /**
   *  Public: constructor for AtomDocDocument instance.
   *
   *  * `filepath` {String} path to file to process.
   */
  function AtomDocDocument(filepath) {
    _classCallCheck(this, AtomDocDocument);

    this.filepath = filepath;
  }
  /**
   *  Public: parses javascript document defined by `this.filepath`.
   *
   *  Returns {Promise} that resolves with a {Result} instance.
   */


  _createClass(AtomDocDocument, [{
    key: 'parse',
    value: function parse() {
      return (0, _fsReadfilePromise2.default)(this.filepath).then(function (buffer) {
        var comments = (0, _extractComments2.default)(buffer.toString());
        var atomDocs = [];
        comments.forEach(function (comment) {
          var value = _fixIndent(comment.value);
          atomDocs.push(_atomdoc2.default.parse(value));
        });
        return new Result(atomDocs);
      });
    }
  }]);

  return AtomDocDocument;
}();

exports.default = AtomDocDocument;
module.exports = exports['default'];
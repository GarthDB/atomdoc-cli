'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _falafel = require('falafel');

var _falafel2 = _interopRequireDefault(_falafel);

var _comment_parser = require('./comment_parser');

var _comment_parser2 = _interopRequireDefault(_comment_parser);

var _content_parser = require('./content_parser');

var _content_parser2 = _interopRequireDefault(_content_parser);

var _content_inspector = require('./content_inspector');

var _content_inspector2 = _interopRequireDefault(_content_inspector);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 *  AtomDocDocument Class
 */
var AtomDocDocument = function () {
  /**
   *  Public: constructor for AtomDocDocument instance.
   *
   *  * `filepath` {String} path to file to process.
   */
  function AtomDocDocument(content) {
    _classCallCheck(this, AtomDocDocument);

    this.content = content;
  }
  /**
   *  Public: parses javascript document defined by `this.filepath`.
   *
   *  Returns {Promise} that resolves with a {Result} instance.
   */


  _createClass(AtomDocDocument, [{
    key: 'process',
    value: function process() {
      var commentParser = new _comment_parser2.default();
      var contentParser = new _content_parser2.default(this.content, commentParser);
      var contentInspector = new _content_inspector2.default(this.content);
      (0, _falafel2.default)(this.content, {
        sourceType: 'module',
        ecmaVersion: '6',
        onComment: commentParser.parseComment.bind(commentParser),
        locations: true,
        allowHashBang: true
      }, function (node) {
        contentInspector.inspectNode(node);
        contentParser.parseNode(node);
      });
      return Promise.all([contentParser.promise, contentInspector.promise]).then(function (result) {
        return Object.assign({}, { parserResult: result[0], inspectorResult: result[1] });
      });
    }
  }]);

  return AtomDocDocument;
}();

exports.default = AtomDocDocument;
module.exports = exports['default'];
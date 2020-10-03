const AtomDoc = require("atomdoc");

/**
 *  CommentParser Class
 */
class CommentParser {
  /**
   *  Public: creates a new CommentParser instance
   *
   *  * `commentsArray` (optional) {Array} an array to add to the instance as the
   *    `comments` property.
   *
   *  ## Examples
   *
   *  Designed to be used by `falafel` to parse javascript comments.
   *
   *  ```js
   *  const commentParser = new CommentParser();
   *  falafel(this.content, {
   *    sourceType: 'module',
   *    ecmaVersion: '6',
   *    onComment: commentParser.parseComment.bind(commentParser),
   *    locations: true,
   *    allowHashBang: true,
   *  }, (node) => {
   *    contentInspector.inspectNode(node);
   *    contentParser.parseNode(node);
   *  });
   *  ```
   */
  constructor(commentsArray = []) {
    this.comments = commentsArray;
  }
  /**
   *  Private: checks if comment is a valid AtomDoc block comment.
   *
   *  * `block` {Boolean} true if comment is a block comment.
   *  * `text` {String} block comment value.
   *
   *  Returns {Boolean} true if AtomDoc.
   */
  _isAtomDocComment(block, text) {
    if (!block) return false;
    return Boolean(text.match(/^[*\s]*(Private:|Public:|Internal:)/));
  }
  /**
   *  Private: adjusts contents of block comments so the base indent is 0.
   *
   *  * `str` {String} block comment.
   *
   *  Returns {String} adjusted content.
   */
  _fixIndent(str) {
    const indentRegEx = /^(\s)*/;
    const indent = str.match(indentRegEx)[0];
    return str.replace(new RegExp(indent, ["g"]), "\n").trim();
  }

  /**
   *  Private: removes astricks from block comments content.
   *
   *  * `str` {String} block comment value.
   *
   *  Returns {String} of block comment without value.
   */
  _removeBlockAstrisks(str) {
    if (str.match(/^\*/)) {
      return str.replace(/^\s*\*/gm, "");
    }
    return str;
  }

  /**
   *  Public: a function that handles comments. Adds result to _comments {Array}.
   *
   *  * `block` {Boolean} true if comment is a block comment.
   *  * `text` {String} block comment value.
   *  * `start` {Integer} the start of the comment.
   *  * `end` {Integer} the end of the comment.
   *
   *  ## Examples
   *
   *  Designed to be used by `falafel` to parse javascript comments.
   *
   *  ```js
   *  const commentParser = new CommentParser();
   *  falafel(this.content, {
   *    sourceType: 'module',
   *    ecmaVersion: '6',
   *    onComment: commentParser.parseComment.bind(commentParser),
   *    locations: true,
   *    allowHashBang: true,
   *  }, (node) => {
   *    contentInspector.inspectNode(node);
   *    contentParser.parseNode(node);
   *  });
   *  ```
   */
  parseComment(block, text, start, end) {
    if (this._isAtomDocComment(block, text)) {
      const value = this._fixIndent(this._removeBlockAstrisks(text));
      const atomDoc = AtomDoc.parse(value);
      this.comments.push(Object.assign(atomDoc, { start, end }));
    }
  }
}
module.exports = CommentParser;

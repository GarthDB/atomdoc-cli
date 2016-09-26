import AtomDoc from 'atomdoc';

export default class CommentParser {
  /**
   *  Public: creates a new CommentParser instance
   *
   *  * `commentsArray` Optional {Array} an array to add to the instance as the `comments` property.
   *
   *  Returns {CommentParser} instance.
   */
  constructor(commentsArray = []) {
    this.comments = commentsArray;
  }
  /**
   *  Public: checks if comment is a valid AtomDoc block comment.
   *
   *  * `block` {Boolean} true if comment is a block comment.
   *  * `text` {String} block comment value.
   *
   *  Returns {Boolean} true if AtomDoc.
   */
  isAtomDocComment(block, text) {
    if (!block) return false;
    return Boolean(text.match(/^[\*\s]*(Private:|Public:|Internal:)/));
  }
  /**
   *  Public: adjusts contents of block comments so the base indent is 0.
   *
   *  * `str` {String} block comment.
   *
   *  Returns {String} adjusted content.
   */
  fixIndent(str) {
    const indentRegEx = /^(\s)*/;
    const indent = str.match(indentRegEx)[0];
    return str.replace(new RegExp(indent, ['g']), '\n').trim();
  }

  /**
   *  Public: removes astricks from block comments content.
   *
   *  * `str` {String} block comment value.
   *
   *  Returns {String} of block comment without value.
   */
  removeBlockAstrisks(str) {
    if (str.match(/^\*/)) {
      return str.replace(/^\s*\*/gm, '');
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
   */
  parseComment(block, text, start, end) {
    if (this.isAtomDocComment(block, text)) {
      const value = this.fixIndent(this.removeBlockAstrisks(text));
      const atomDoc = AtomDoc.parse(value);
      this.comments.push(Object.assign(atomDoc, { start, end }));
    }
  }
}

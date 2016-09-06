import readFile from 'fs-readfile-promise';
import extract from 'extract-comments';
import AtomDoc from 'atomdoc';

/**
 *  Private: adjusts contents of block comments so the base indent is 0.
 *
 *  * `str` {String} block comment.
 *
 *  Returns {String} adjusted content.
 */
const _fixIndent = (str) => {
  const indentRegEx = /^(\s)*/;
  const indent = str.match(indentRegEx)[0];
  if (indent !== '') {
    return str.replace(new RegExp(indent, ['g']), '\n').trim();
  }
  return str;
};

/**
 *  Result Class
 */
class Result {
  /**
   *  Public: constructor for result instance.
   *
   *  * `atomDocs` {Array} of AtomDoc {Objects}
   */
  constructor(atomDocs) {
    this.docs = atomDocs;
  }
  /**
   *  Public: converts atomdocs result to {String}
   *
   *  Returns ready to print {String}
   */
  toString() {
    return JSON.stringify(this.docs, null, 2);
  }
}

/**
 *  AtomDocDocument Class
 */
export default class AtomDocDocument {
  /**
   *  Public: constructor for AtomDocDocument instance.
   *
   *  * `filepath` {String} path to file to process.
   */
  constructor(filepath) {
    this.filepath = filepath;
  }
  /**
   *  Public: parses javascript document defined by `this.filepath`.
   *
   *  Returns {Promise} that resolves with a {Result} instance.
   */
  parse() {
    return readFile(this.filepath).then(buffer => {
      const comments = extract(buffer.toString());
      const atomDocs = [];
      comments.forEach(comment => {
        const value = _fixIndent(comment.value);
        atomDocs.push(AtomDoc.parse(value));
      });
      return new Result(atomDocs);
    });
  }
}

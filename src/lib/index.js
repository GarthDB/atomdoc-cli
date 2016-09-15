import readFile from 'fs-readfile-promise';
import parseContent from './parse_content';
import inspectContent from './inspect_content';

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
    return readFile(this.filepath).then(buffer => buffer.toString())
    .then(parseContent)
    .then((result) => {
      const results = new Result(result);
      return results;
    });
  }
  inspect() {
    return readFile(this.filepath).then(buffer => buffer.toString())
    .then(inspectContent)
    .then((result) => {
      return result;
    });
  }
}

import readFile from 'fs-readfile-promise';
import parseContent from './parse_content';

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
}

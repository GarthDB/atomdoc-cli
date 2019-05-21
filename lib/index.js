const falafel = require('falafel');
const CommentParser = require('./comment_parser');
const ContentParser = require('./content_parser');
const ContentInspector = require('./content_inspector');

/**
 *  Result Class
 */
class Result {
  /**
   *  Private: a typed object to hold the expected results of inspecting and parsing
   *  the javascript content.
   *
   *  * `result` {Array} of `[0]` of modified AtomDoc {Doc} with `name`, `definitionLine`,
   *    `start`, `end`, and `className` properties added.
   */
  constructor(result) {
    this.parserResult = result[0];
    this.inspectorResult = result[1];
  }
  // TODO make documentation public with example
  /**
   *  Private: using the `definitionLine` this function finds the matching AtomDoc Document.
   *
   *  * `definitionLine` {Int} the line the function is defined.
   *
   *  Returns AtomDoc {Doc} that matches the `definitionLine`.
   */
  findAtomDoc(definitionLine) {
    return this.parserResult.find(method =>
      Boolean(method.definitionLine === definitionLine)
    );
  }
  // TODO make a better modular test for this method.
  // TODO make documentation public with example
}

/**
 *  AtomDocDocument Class
 */
class AtomDocDocument {
  /**
   *  Public: constructor for AtomDocDocument instance.
   *
   *  * `content` {String} the raw content of the javascript file to be parsed and inspected.
   *
   *  ## Examples
   *
   *  ```js
   *  const content = fs.readFileSync(filepath, 'utf-8');
   *  const doc = new AtomDocDocument(content);
   *  ```
   */
  constructor(content) {
    this.content = content;
  }
  /**
   *  Public: parses javascript document defined by `this.filepath`.
   *
   *  ## Examples
   *
   *  ```js
   *  const content = fs.readFileSync(filepath, 'utf-8');
   *  const doc = new AtomDocDocument(content);
   *  doc.process().then(result => {
   *    result.parserResult;
   *    result.inspectorResult;
   *  });
   *  ```
   *
   *  Returns {Promise} that resolves with a {Result} instance.
   */
  process() {
    const commentParser = new CommentParser();
    const contentParser = new ContentParser(this.content, commentParser);
    const contentInspector = new ContentInspector(this.content);
    falafel(
      this.content,
      {
        sourceType: 'module',
        ecmaVersion: '6',
        onComment: commentParser.parseComment.bind(commentParser),
        locations: true,
        allowHashBang: true,
      },
      node => {
        contentInspector.inspectNode(node);
        contentParser.parseNode(node);
      }
    );
    return Promise.all([contentParser.promise, contentInspector.promise]).then(
      result => new Result(result)
    );
  }
}

module.exports = AtomDocDocument;

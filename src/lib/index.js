import falafel from 'falafel';
import CommentParser from './comment_parser';
import ContentParser from './content_parser';
import ContentInspector from './content_inspector';

/**
 *  AtomDocDocument Class
 */
export default class AtomDocDocument {
  /**
   *  Public: constructor for AtomDocDocument instance.
   *
   *  * `filepath` {String} path to file to process.
   */
  constructor(content) {
    this.content = content;
  }
  /**
   *  Public: parses javascript document defined by `this.filepath`.
   *
   *  Returns {Promise} that resolves with a {Result} instance.
   */
  process() {
    const commentParser = new CommentParser();
    const contentParser = new ContentParser(this.content, commentParser);
    const contentInspector = new ContentInspector(this.content);
    falafel(this.content, {
      sourceType: 'module',
      ecmaVersion: '6',
      onComment: commentParser.parseComment.bind(commentParser),
    }, (node) => {
      contentInspector.inspectNode(node);
      contentParser.parseNode(node);
    });
    return Promise.all([contentParser.promise, contentInspector.promise]).then(result =>
      Object.assign({}, { parserResult: result[0], inpsectorResult: result[1] })
    );
  }
}

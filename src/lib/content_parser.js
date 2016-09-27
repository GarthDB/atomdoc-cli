function _getNodeType(node) {
  return (node.type !== 'Identifier') ? node.type : node.parent.type;
}

function _getHandler(nodeType, handlerObj) {
  if ({}.hasOwnProperty.call(handlerObj, nodeType)) {
    return handlerObj[nodeType];
  }
  return false;
}

const _typeHandlers = {
  ArrowFunctionExpression(comment, node) {
    comment.className = false;
    comment.name = false;
    try {
      comment.name = node.parent.id.name;
    } catch (err) { /**/ }
    comment.definitionLine = node.loc.start.line;
  },
  FunctionDeclaration(comment, node) {
    comment.className = false;
    comment.name = node.id.name || false;
    comment.definitionLine = node.loc.start.line;
  },
  FunctionExpression(comment, node) {
    if (node.parent.type === 'Property') {
      comment.className = false;
      comment.name = node.parent.key.name || false;
      comment.definitionLine = node.loc.start.line;
    }
    if (node.parent.type === 'VariableDeclarator') {
      comment.className = false;
      comment.name = node.parent.id.name || false;
      comment.definitionLine = node.loc.start.line;
    }
  },
  MethodDefinition(comment, node) {
    comment.className = false;
    comment.name = node.key.name;
    comment.definitionLine = node.loc.start.line;
    try {
      comment.className = node.parent.parent.id.name;
    } catch (err) { /**/ }
  },
};

/**
 *  Private: determines the index for the comment in the `comments`
 *
 *  * `comments` {Array} of AtomDoc comments.
 *  * `endPos` {Integer} end position of the current node.
 *
 *  Returns {Integer} index of the next comment.
 */
function _getNextCommentIndex(comments, node) {
  return comments.findIndex((comment, index, array) => {
    if (index >= (array.length - 1)) {
      return Boolean(node.start >= comment.end);
    }
    const next = array[index + 1];
    return (node.start >= comment.end && node.end <= next.start);
  });
}

/**
 * ContentParser Class
 */
export default class ContentParser {
  /**
   *  Public: ContentParser parses Spidermonkey AST nodes to extract function
   *  and class names to add to AtomDoc parsed comment results provided by the
   *  `commentParser` property. When the content parser finishes the last node
   *  it resolves the `promise` {Promise} property passing the {Result} instance
   *  back. Alternatively, you can use the `parseNode` `callback` parameter.
   *
   *  * `content` {String} Javscript file content being parsed
   *  * `commentParser` {CommentParser} instance which has the `comments`
   *    property that contains the atomdoc parsed comments.
   *
   *  Returns {ContentParser} instance.
   */
  constructor(content, commentParser) {
    this.content = content;
    this.commentIndex = -1;
    this.captureNextFunctionName = false;
    this.commentParser = commentParser;
    this.promise = new Promise((resolve) => {
      this.resolve = resolve;
    });
  }
  /**
   *  Public: parses node and updates corresponding comments on `this.commentParser.comments`.
   *
   *  * `node` {Object} Spidermonkey AST node.
   */
  parseNode(node) {
    const nodeType = _getNodeType(node);
    const _node = (nodeType !== node.type) ? node.parent : node;
    const handler = _getHandler(_node.type, _typeHandlers);
    if (this.captureNextFunctionName && handler) {
      handler(this.commentParser.comments[this.commentIndex], _node);
      this.captureNextFunctionName = false;
    }
    const nextCommentIndex = _getNextCommentIndex(this.commentParser.comments, _node);
    if (nextCommentIndex > this.commentIndex) {
      this.commentIndex = nextCommentIndex;
      this.captureNextFunctionName = true;
      if (handler) {
        handler(this.commentParser.comments[this.commentIndex], _node);
        this.captureNextFunctionName = false;
      }
    }
    if (node.end === this.content.length) this.resolve(this.commentParser.comments);
  }
}

/**
 *  Private: `Identifier` {Node}s are parsed in the correct order, so it's easiest
 *  to look for those and then parse their parent nodes.
 *
 *  * `node` {Node} to see if it is an `Identifier`.
 *
 *  Returns {Node} either the `node` itself of the parent.
 */
function _getNodeType(node) {
  return (node.type !== 'Identifier') ? node.type : node.parent.type;
}

/**
 *  Private: uses `nodeType` to determine which handler method should be used to
 *  parse a node.
 *
 *  * `nodeType` {String} the `type` property of a {Node}.
 *  * `handlerObj` {Object} of {Function}s whose property names match {Node} `type`.
 *
 *  Returns {Function} when the `nodeType` matches a `handlerObj` property.
 *  Returns {false} when no `nodeType` matches.
 */
function _getHandler(nodeType, handlerObj) {
  if ({}.hasOwnProperty.call(handlerObj, nodeType)) {
    return handlerObj[nodeType];
  }
  return false;
}

const _typeHandlers = {
  /**
   *  Private: uses `ArrowFunctionExpression` {Node}s to find the `name` and `definitionLine`.
   *
   *  * `comment` AtomDoc {Doc} that corresponds to `node`.
   *  * `node` the {Node} to parse.
   */
  ArrowFunctionExpression(comment, node) {
    comment.className = false;
    comment.name = false;
    try {
      comment.name = node.parent.id.name;
    } catch (err) { /**/ }
    comment.definitionLine = node.loc.start.line;
  },
  /**
   *  Private: uses `FunctionDeclaration` {Node}s to find the `name` and `definitionLine`.
   *
   *  * `comment` AtomDoc {Doc} that corresponds to `node`.
   *  * `node` the {Node} to parse.
   */
  FunctionDeclaration(comment, node) {
    comment.className = false;
    comment.name = node.id.name || false;
    comment.definitionLine = node.loc.start.line;
  },
  /**
   *  Private: uses `FunctionExpression` {Node}s to find the `name` and `definitionLine`.
   *
   *  * `comment` AtomDoc {Doc} that corresponds to `node`.
   *  * `node` the {Node} to parse.
   */
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
  /**
   *  Private: uses `MethodDefinition` {Node}s to find the `name` and `definitionLine`.
   *
   *  * `comment` AtomDoc {Doc} that corresponds to `node`.
   *  * `node` the {Node} to parse.
   */
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
 *  * `node` the current {Node}, this method uses the `start` property to find the
 *    location of the next comment and return its index.
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
   *  Public: ContentParser parses Spidermonkey AST {Node}s to extract function
   *  and class names to add to AtomDoc parsed comment results provided by the
   *  `commentParser` property. When the content parser finishes the last node
   *  it resolves the `promise` {Promise} property passing an {Array} of modified
   *  AtomDoc {Doc}s back.
   *
   *  * `content` {String} Javscript file content being parsed
   *  * `commentParser` {CommentParser} instance which has the `comments`
   *    property that contains the atomdoc parsed comments.
   *
   *  ## Examples
   *
   *  ```js
   *  const commentParser = new CommentParser();
   *  const contentParser = new ContentParser(content, commentParser);
   *  falafel(this.content, {
   *    sourceType: 'module',
   *    ecmaVersion: '6',
   *    onComment: commentParser.parseComment.bind(commentParser),
   *    locations: true,
   *    allowHashBang: true,
   *  }, (node) => {
   *    contentParser.parseNode(node);
   *  });
   *  ```
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
   *
   *  ## Examples
   *
   *  ```js
   *  const commentParser = new CommentParser();
   *  const contentParser = new ContentParser(content, commentParser);
   *  falafel(this.content, {
   *    sourceType: 'module',
   *    ecmaVersion: '6',
   *    onComment: commentParser.parseComment.bind(commentParser),
   *    locations: true,
   *    allowHashBang: true,
   *  }, (node) => {
   *    contentParser.parseNode(node);
   *  });
   *  ```
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

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
 *  Private: If `node.type` is `Identifier` this function returns the type of the parent node.
 *
 *  * `node` {Object} Spidermonkey AST node.
 *
 *  Returns {String} the Spidermonkey node type.
 */
function _getNodeType(node) {
  return (node.type !== 'Identifier') ? node.type : node.parent.type;
}

/**
 *  Private: Checks `node.type` to see if it is a function node.
 *
 *  * `node` {Object} Spidermonkey AST node
 *
 *  Returns {Boolean} if it is a function node.
 */
function _nodeTest(node) {
  const nodeType = _getNodeType(node);
  const functionTypes = [
    'FunctionDeclaration',
    'ArrowFunctionExpression',
    'VariableDeclarator',
    'MethodDefinition',
  ];
  return functionTypes.includes(nodeType);
}

/**
 *  Private: gets the name of the function
 *
 *  * `node` {Object} Spidermonkey AST node.
 *
 *  Returns {String} of the function name.
 */
function _getFunctionName(node) {
  const nodeType = _getNodeType(node);
  const _node = (nodeType !== node.type) ? node.parent : node;
  switch (nodeType) {
    case ('MethodDefinition'):
      return _node.key.name;
    case ('FunctionDeclaration'):
    case ('VariableDeclarator'):
      return _node.id.name;
    case ('ArrowFunctionExpression'):
      if (_node.parent.id) return _node.parent.id.name;
    // eslint-disable-next-line no-fallthrough
    default:
      return null;
  }
}

/**
 *  Private: attaches name value to AtomDoc result. If node is a method definition
 *  it attaches the class name as well.
 *
 *  * `node` {Object} Spidermonkey AST node.
 *  * `comment` {Object} AtomDocDocument.
 */
function _addFunctionName(node, comment) {
  comment.name = _getFunctionName(node);
  if (_getNodeType(node) === 'MethodDefinition') {
    try {
      comment.className = node.parent.parent.parent.id.name;
    } catch (err) { /**/ }
  }
}

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

export default class ContentParser {
  constructor(content, commentParser) {
    this.content = content;
    this.commentIndex = -1;
    this.captureNextFunctionName = false;
    this.commentParser = commentParser;
  }
  parseNode(node, callback) {
    if (this.captureNextFunctionName && _nodeTest(node)) {
      _addFunctionName(node, this.commentParser.comments[this.commentIndex]);
      this.captureNextFunctionName = false;
    }
    const nextCommentIndex = _getNextCommentIndex(this.commentParser.comments, node);
    if (nextCommentIndex > this.commentIndex) {
      this.commentIndex = nextCommentIndex;
      if (_nodeTest(node)) {
        _addFunctionName(node, this.commentParser.comments[this.commentIndex]);
      } else {
        this.captureNextFunctionName = true;
      }
    }
    if (node.end === this.content.length) callback(new Result(this.commentParser.comments));
  }
}

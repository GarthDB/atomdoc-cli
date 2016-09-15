import falafel from 'falafel';
import AtomDoc from 'atomdoc';

const _comments = [];

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
 *  Private: adjusts contents of block comments so the base indent is 0.
 *
 *  * `str` {String} block comment.
 *
 *  Returns {String} adjusted content.
 */
function _fixIndent(str) {
  const indentRegEx = /^(\s)*/;
  const indent = str.match(indentRegEx)[0];
  return str.replace(new RegExp(indent, ['g']), '\n').trim();
}

/**
 *  Private: removes astricks from block comments content.
 *
 *  * `str` {String} block comment value.
 *
 *  Returns {String} of block comment without value.
 */
function _removeBlockAstrisks(str) {
  if (str.match(/^\*/)) {
    return str.replace(/^\s*\*/gm, '');
  }
  return str;
}

/**
 *  Private: checks if comment is a valid AtomDoc block comment.
 *
 *  * `block` {Boolean} true if comment is a block comment.
 *  * `text` {String} block comment value.
 *
 *  Returns {Boolean} true if AtomDoc.
 */
function _isAtomDocComment(block, text) {
  if (!block) return false;
  return Boolean(text.match(/^[\*\s]*(Private:|Public:|Internal:)/));
}

/**
 *  Private: a function that handles comments. Adds result to _comments {Array}.
 *
 *  * `block` {Boolean} true if comment is a block comment.
 *  * `text` {String} block comment value.
 *  * `start` {Integer} the start of the comment.
 *  * `end` {Integer} the end of the comment.
 */
function _parseComment(block, text, start, end) {
  if (_isAtomDocComment(block, text)) {
    const value = _fixIndent(_removeBlockAstrisks(text));
    const atomDoc = AtomDoc.parse(value);
    _comments.push(Object.assign({}, atomDoc, { start, end }));
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


/**
 *  Public: takes javascript content and generates AtomDoc objects with function name.
 *
 *  * `content` {String} javascript file content.
 *
 *  Returns {Promise} which resolves with a Result {Object}.
 */
export default function parseContent(content) {
  return new Promise((resolve) => {
    let commentIndex = -1;
    let captureNextFunctionName = false;
    _comments.length = 0;
    falafel(content, {
      sourceType: 'module',
      ecmaVersion: '6',
      onComment: _parseComment,
    }, (node) => {
      if (captureNextFunctionName && _nodeTest(node)) {
        _addFunctionName(node, _comments[commentIndex]);
        captureNextFunctionName = false;
      }
      const nextCommentIndex = _getNextCommentIndex(_comments, node);
      if (nextCommentIndex > commentIndex) {
        commentIndex = nextCommentIndex;
        if (_nodeTest(node)) {
          _addFunctionName(node, _comments[commentIndex]);
        } else {
          captureNextFunctionName = true;
        }
      }
      if (node.end === content.length) resolve(_comments);
    });
  });
}

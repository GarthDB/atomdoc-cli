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
 *  Public: Checks `node.type` to see if it is a function node.
 *
 *  * `node` {Object} Spidermonkey AST node
 *
 *  ## Examples
 *
 *  ```js
 *  const valid = nodeTest(node);
 *  ```
 *
 *  Returns {Boolean} if it is a function node.
 */
function nodeTest(node) {
  const nodeType = _getNodeType(node);
  const functionTypes = [
    'FunctionDeclaration',
    'ArrowFunctionExpression',
    'VariableDeclarator',
    'MethodDefinition',
  ];
  return functionTypes.includes(nodeType);
}

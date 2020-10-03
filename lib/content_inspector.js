/**
 *  InspectorMethod Class
 */
class InspectorMethod {
  /**
   *  Private: a typed object to hold the expected results of inspecting the javascript content.
   *
   *  * `type` {String} function type.
   *  * `name` {String} the identifier name for the function.
   *  * `className` {String} of the class that contains the method, or {false} if
   *    the method is not part of a class.
   *  * `start` {Int} the character start point of the method.
   *  * `end` {Int} the character end point of the method.
   *  * `definitionLine` {Int} the line number of the start of the definition of the method.
   *  * `args` {Array} of {Param}
   *  * `returns` {Array} of {ReturnResult}
   */
  constructor(
    type,
    name,
    className,
    start,
    end,
    definitionLine,
    args,
    returns
  ) {
    const params = {
      type,
      name,
      className,
      start,
      end,
      definitionLine,
      args,
      returns,
    };
    Object.assign(this, params);
  }
}

const privateReturnProps = new WeakMap();

/**
 *  ReturnResult Class
 */
class ReturnResult {
  /**
   *  Private: a typed object to hold the expected results of the returns contained
   *  in the method.
   *
   *  * `start` {Int} the character start point of the return statement.
   *  * `end` {Int} the character end point of the return statement.
   *  * `funcLine` {Int} definition line number of function ended by return.
   *  * `name` (optional) {String} identifier in the return statement if it has one, else is false.
   */
  constructor(start, end, funcLine, name = false) {
    const params = {start, end, name};
    Object.assign(this, params);
    privateReturnProps.set(this, {funcLine});
  }
  /**
   *  Public: getter for func property so it doesn't show up when comparing the object in the test.
   *
   *  ## Examples
   *
   *  ```js
   *  const returnResult = new ReturnResult(1,2,node.source);
   *  returnResult.funcLine; // node.source
   *  ```
   *
   *  Returns {Int} definition line number of function ended by return.
   */
  get funcLine() {
    return privateReturnProps.get(this).funcLine;
  }
}

/**
 *  Param Class
 */
class Param {
  /**
   *  Private: a typed object to hold the expected results of the parameters found
   *  in the method definition.
   *
   *  * `name` {String} parameter identifier.
   *  * `optional` (optional) {Boolean} if the parameter has a default value this
   *    is true, otherwise false.
   *  * `children` (optional) {Array} of children {Param}s.
   */
  constructor(name, optional = false, children = false) {
    this.name = name;
    this.optional = optional;
    if (children !== false) this.children = children;
  }
}

/**
 *  Private: finds `ReturnStatement` {Node}s within a function.
 *
 *  * `node` {Node} Spidermonkey AST node.
 *  * `returnsArr` {Array} of {ReturnResult}s from parsing all the `ReturnStatement` {Node}s.
 *
 *  Returns {Array} of {ReturnResult}s that have definitions that are contained within
 *  the `node` `start` and `end`.
 */
function _getReturns(node, returnsArr) {
  return returnsArr.filter(returnResult =>
    Boolean(node.loc.start.line === returnResult.funcLine)
  );
}

/**
 *  Private: finds parameters.
 *
 *  * `params` {Array} of Identifier {Node}s describing parameters.
 *
 *  Returns {Array} of {Param}.
 */
function _parseParams(params) {
  return params.map(param => {
    let result;
    switch (param.type) {
      case 'Identifier':
        result = new Param(param.name);
        break;
      case 'AssignmentPattern':
        result = new Param(param.left.name, true);
        break;
      case 'ObjectPattern': {
        const objParams = param.properties.map(objParam => objParam.value);
        result = new Param('arguments', false, _parseParams(objParams));
        break;
      }
      default:
    }
    return result;
  });
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
   *  Private: parses `ArrowFunctionExpression` {Node}s
   *
   *  * `node` {Node} of type `ArrowFunctionExpression`
   *  * `arr` {Array} of {InspectorMethod} results. Results of parsing this {Node}
   *    will be added to this.
   *  * `returnsArr` {Array} of {ReturnResult}.
   */
  ArrowFunctionExpression(node, arr, returnsArr) {
    if (
      node.parent.type === 'VariableDeclarator' ||
      node.parent.type === 'ExpressionStatement'
    ) {
      let name = false;
      try {
        name = node.parent.id.name;
      } catch (err) {
        /* */
      }
      const args = _parseParams(node.params);
      const returns = _getReturns(node, returnsArr);
      const result = new InspectorMethod(
        node.type,
        name,
        false,
        node.start,
        node.end,
        node.loc.start.line,
        args,
        returns
      );
      arr.push(result);
    }
    if (node.parent.type === 'AssignmentExpression') {
      const name = node.parent.left.name;
      const args = _parseParams(node.params);
      const returns = _getReturns(node, returnsArr);
      const result = new InspectorMethod(
        node.type,
        name,
        false,
        node.start,
        node.end,
        node.loc.start.line,
        args,
        returns
      );
      arr.push(result);
    }
  },
  /**
   *  Private: parses `FunctionDeclaration` {Node}s
   *
   *  * `node` {Node} of type `FunctionDeclaration`
   *  * `arr` {Array} of {InspectorMethod} results. Results of parsing this {Node}
   *    will be added to this.
   *  * `returnsArr` {Array} of {ReturnResult}.
   */
  FunctionDeclaration(node, arr, returnsArr) {
    const name = node.id.name || false;
    const args = _parseParams(node.params);
    const returns = _getReturns(node, returnsArr);
    const result = new InspectorMethod(
      node.type,
      name,
      false,
      node.start,
      node.end,
      node.loc.start.line,
      args,
      returns
    );
    arr.push(result);
  },
  /**
   *  Private: parses `FunctionExpression` {Node}s
   *
   *  * `node` {Node} of type `FunctionExpression`
   *  * `arr` {Array} of {InspectorMethod} results. Results of parsing this {Node}
   *    will be added to this.
   *  * `returnsArr` {Array} of {ReturnResult}.
   */
  FunctionExpression(node, arr, returnsArr) {
    if (node.parent.type === 'Property') {
      const name = node.parent.key.name || false;
      const args = _parseParams(node.params);
      const returns = _getReturns(node, returnsArr);
      const result = new InspectorMethod(
        node.type,
        name,
        false,
        node.start,
        node.end,
        node.loc.start.line,
        args,
        returns
      );
      arr.push(result);
    }
    if (node.parent.type === 'VariableDeclarator') {
      const name = node.parent.id.name || false;
      const args = _parseParams(node.params);
      const returns = _getReturns(node, returnsArr);
      const result = new InspectorMethod(
        node.type,
        name,
        false,
        node.start,
        node.end,
        node.loc.start.line,
        args,
        returns
      );
      arr.push(result);
    }
    if (node.parent.type === 'AssignmentExpression') {
      const name = node.parent.left.name;
      const args = _parseParams(node.params);
      const returns = _getReturns(node, returnsArr);
      const result = new InspectorMethod(
        node.type,
        name,
        false,
        node.start,
        node.end,
        node.loc.start.line,
        args,
        returns
      );
      arr.push(result);
    }
  },
  /**
   *  Private: parses `MethodDefinition` {Node}s
   *
   *  * `node` {Node} of type `MethodDefinition`
   *  * `arr` {Array} of {InspectorMethod} results. Results of parsing this {Node}
   *    will be added to this.
   *  * `returnsArr` {Array} of {ReturnResult}.
   */
  MethodDefinition(node, arr, returnsArr) {
    const name = node.key.name;
    const args = _parseParams(node.value.params);
    let className = false;
    try {
      className = node.parent.parent.id.name;
    } catch (err) {
      /**/
    }
    const returns = _getReturns(node, returnsArr);
    const result = new InspectorMethod(
      node.type,
      name,
      className,
      node.start,
      node.end,
      node.loc.start.line,
      args,
      returns
    );
    arr.push(result);
  },
  /**
   *  Private: parses `ReturnStatement` {Node}s and adds results to `returnsArr`.
   *
   *  * `node` {Node} of type `MethodDefinition`
   *  * `arr` {Array} of {InspectorMethod} results. Not used, but left to have the
   *    same structure as the other type handler methods.
   *  * `returnsArr` {Array} of {ReturnResult}, the result of parsing each
   *    `ReturnStatement` {Node} is add to this.
   */
  ReturnStatement(node, arr, returnsArr) {
    let name = false;
    try {
      name = node.argument.name;
    } catch (err) {
      /**/
    }
    let funcLine = false;
    let currentNode = node.parent;
    while (!funcLine) {
      const handler = _getHandler(currentNode.type, _typeHandlers);
      if (handler) {
        funcLine = currentNode.loc.start.line;
      } else {
        currentNode = currentNode.parent;
      }
    }
    const result = new ReturnResult(node.start, node.end, funcLine, name);
    returnsArr.push(result);
  },
};

/**
 *  ContentInspector Class
 */
class ContentInspector {
  /**
   *  Public: creates an instance of ContentInspector to parse `content`.
   *
   *  Public: ContentInspector inpsect Spidermonkey AST {Node}s to process method
   *  attributes. When the content inspector finishes the last node it resolves the
   *  `promise` {Promise} property passing an {Array} of {InspectorMethod}s back.
   *
   *  * `content` {String} the raw content of the javascript file, used to identify the last {Node}.
   *
   *  ## Examples
   *
   *  ```js
   *  const commentParser = new CommentParser();
   *  const contentInspector = new ContentInspector(this.content);
   *  falafel(this.content, {
   *    sourceType: 'module',
   *    ecmaVersion: '6',
   *    onComment: commentParser.parseComment.bind(commentParser),
   *    locations: true,
   *    allowHashBang: true,
   *  }, (node) => {
   *    contentInspector.inspectNode(node);
   *  });
   *  ```
   */
  constructor(content) {
    this.content = content;
    this.functions = [];
    this.returns = [];
    this.promise = new Promise(resolve => {
      this.resolve = resolve;
    });
  }
  /**
   *  Public: gathers information about the methods in the `content` and adds results
   *  to `this.functions`.
   *
   *  * `node` A Spidermonkey AST {Node} to inspect.
   *
   *  ## Examples
   *
   *  ```js
   *  const commentParser = new CommentParser();
   *  const contentInspector = new ContentInspector(this.content);
   *  falafel(this.content, {
   *    sourceType: 'module',
   *    ecmaVersion: '6',
   *    onComment: commentParser.parseComment.bind(commentParser),
   *    locations: true,
   *    allowHashBang: true,
   *  }, (node) => {
   *    contentInspector.inspectNode(node);
   *  });
   *  ```
   */
  inspectNode(node) {
    const handler = _getHandler(node.type, _typeHandlers);
    if (handler) handler(node, this.functions, this.returns);
    if (node.end === this.content.length) this.resolve(this.functions);
  }
}

module.exports = ContentInspector;

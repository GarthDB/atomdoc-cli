class InspectorMethod {
  constructor(type, name, className, start, end, definitionLine, args, returns) {
    const params = { type, name, className, start, end, definitionLine, args, returns };
    Object.assign(this, params);
  }
}

class ReturnResult {
  constructor(start, end, name = false) {
    const params = { start, end, name };
    Object.assign(this, params);
  }
}

class Param {
  constructor(name, optional = false) {
    this.name = name;
    this.optional = optional;
  }
}

function _getReturns(node, returnsArr) {
  const start = node.start;
  const end = node.end;
  return returnsArr.filter(returnResult =>
    Boolean(returnResult.start >= start && returnResult.end <= end)
  );
}

function _parseParams(params) {
  return params.map((param) => {
    let result;
    switch (param.type) {
      case 'Identifier':
        result = new Param(param.name);
        break;
      case 'AssignmentPattern':
        result = new Param(param.left.name, true);
        break;
      default:
    }
    return result;
  });
}

const _typeHandlers = {
  ArrowFunctionExpression(node, arr, returnsArr) {
    if (node.parent.type === 'VariableDeclarator') {
      const name = node.parent.id.name;
      const args = _parseParams(node.params);
      const returns = _getReturns(node, returnsArr);
      const result = new InspectorMethod(node.type, name, false, node.start, node.end,
        node.loc.start.line, args, returns);
      arr.push(result);
    }
  },
  FunctionDeclaration(node, arr, returnsArr) {
    const name = node.id.name || false;
    const args = _parseParams(node.params);
    const returns = _getReturns(node, returnsArr);
    const result = new InspectorMethod(node.type, name, false, node.start, node.end,
      node.loc.start.line, args, returns);
    arr.push(result);
  },
  FunctionExpression(node, arr, returnsArr) {
    if (node.parent.type === 'Property') {
      const name = node.parent.key.name || false;
      const args = _parseParams(node.params);
      const returns = _getReturns(node, returnsArr);
      const result = new InspectorMethod(node.type, name, false, node.start, node.end,
        node.loc.start.line, args, returns);
      arr.push(result);
    }
    if (node.parent.type === 'VariableDeclarator') {
      const name = node.parent.id.name || false;
      const args = _parseParams(node.params);
      const returns = _getReturns(node, returnsArr);
      const result = new InspectorMethod(node.type, name, false, node.start, node.end,
        node.loc.start.line, args, returns);
      arr.push(result);
    }
  },
  MethodDefinition(node, arr, returnsArr) {
    const name = node.key.name;
    const args = _parseParams(node.value.params);
    let className = false;
    try {
      className = node.parent.parent.id.name;
    } catch (err) { /**/ }
    const returns = _getReturns(node, returnsArr);
    const result = new InspectorMethod(node.type, name, className, node.start, node.end,
      node.loc.start.line, args, returns);
    arr.push(result);
  },
  ReturnStatement(node, arr, returnsArr) {
    let name = false;
    try {
      name = node.argument.name;
    } catch (err) { /**/ }
    const result = new ReturnResult(node.start, node.end, name);
    returnsArr.push(result);
  },
};

function _getHandler(nodeType, handlerObj) {
  if ({}.hasOwnProperty.call(handlerObj, nodeType)) {
    return handlerObj[nodeType];
  }
  return false;
}

export default class ContentInspector {
  constructor(content) {
    this.content = content;
    this.functions = [];
    this.returns = [];
    this.promise = new Promise((resolve) => {
      this.resolve = resolve;
    });
  }
  inspectNode(node) {
    const handler = _getHandler(node.type, _typeHandlers);
    if (handler) handler(node, this.functions, this.returns);
    if (node.end === this.content.length) this.resolve(this.functions);
  }
}

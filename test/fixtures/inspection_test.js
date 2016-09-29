/**
 *  Public: A FunctionDeclaration
 *
 *  * `param1` {String} description
 *  * `param2` {Object} description
 *
 *  Returns {Boolean} always true.
 */
function newFunc(param1, param2 ={}) {
  return Boolean(true);
}

const anotherFun = (optionalParam = false) => {
  if(optionalParam) return optionalParam;
  if(!optionalParam) return optionalParam;
}

export default class Poop {
  /**
   *  Public: makes a new poop instance
   */
  constructor(test) {
    this.test = test;
    const arr = ['one', 'two', 'three'];
    const newArr = arr.filter(number => {
      return (number === 'one');
    })
  }
}
let newVarFunction = function (val) {
  return val;
}
newVarFunction = function (param) {
  console.log(param);
}
newVarFunction = (oneMore) => {
  return;
}

const _typeHandlers = {
  /**
   *  Public: function declaration
   *
   *  * `node` {Object} Spidermonkey AST node
   *  * `arr` {Array} of {Objects}
   *  * `returnsArr` {Array} of Returns
   */
  objectFunction(node, arr, returnsArr) {
    const name = node.id.name || false;
    const args = _parseParams(node.params);
    const returns = _getReturns(node, returnsArr);
    const result = new Method(node.type, name, false, node.start, node.end, args, returns);
    arr.push(result);
  },
}

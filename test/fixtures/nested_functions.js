/**
 *  Public: this is a function.
 *
 *  * `param1` {Boolean} first param
 *  * `param2` (optional) {Boolean} second param
 *
 *  Returns {Boolean}
 */
function one(param1, param2 = false) {
  /**
   *  Public: a nested function
   *
   *  * `prop1` {Boolean} first property
   *  * `prop2` {Boolean} second property
   *
   *  Returns {Boolean}
   */
  function two (prop1, prop2) {
    return prop1 || prop2;
  }
  return two(true, false);
}

/**
 *  Public: simple sample funtion.
 *
 *  * `arguments` {Object}
 *    * `name` {String} the name
 *    * `val` {Number} some number
 *
 *  ## Examples
 *
 *  ```js
 *  h({ str: "bar", val: 42 });
 *  ```
 */
function h ({ str, val = 12 }) {
  console.log(str, val)
}

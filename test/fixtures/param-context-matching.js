/**
 *  Public: simple sample funtion.
 *
 *  * `arguments` {Object}
 *    * `str` {String} the name
 *    * `val` (optional) {Number} some number
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

/**
 *  Public: simple sample funtion.
 *
 *  * `arguments` {Object}
 *    * `name` {String} the name
 *    * `val` (optional) {Number} some number
 *
 *  ## Examples
 *
 *  ```js
 *  h({ str: "bar", val: 42 });
 *  ```
 */
function g ({ str, val = 12 }) {
  console.log(str, val)
}

/**
 *  Public: simple sample funtion.
 *
 *  * `arguments` {Object}
 *    * `str` {String} the name
 *    * `val` {Number} some number
 *
 *  ## Examples
 *
 *  ```js
 *  h({ str: "bar", val: 42 });
 *  ```
 */
function i ({ str, val = 12 }) {
  console.log(str, val)
}

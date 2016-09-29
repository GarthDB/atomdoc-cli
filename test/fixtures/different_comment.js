/**
 *  Public: just returns `val`.
 *
 *  * `val` {String} any string.
 *
 *  Returns {String} same `val`.
 */
let list = function (val) {
  return val;
}
/*
 Public: parses a string representing an array into an Array.

 * `val` {String} list string.

 Returns {Array}
 */
list = function (val) {
  const result = val.replace(/(^(?:"|')?\[)|(](?:"|')?$)/g, '').split(',');
  // This is just a regular comment.
  return result.map((item) => item.trim().replace(/(^(?:"|')?)|((?:"|')?$)/g, ''));
};

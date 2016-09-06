/**
 *  Public: parses a string representing an array into an Array.
 *
 *  * `val` {String} list string.
 *
 *  Returns {Array}
 */
function list(val) {
  const result = val.replace(/(^(?:"|')?\[)|(](?:"|')?$)/g, '').split(',');
  // This is just a regular comment.
  return result.map((item) => item.trim().replace(/(^(?:"|')?)|((?:"|')?$)/g, ''));
}

export default class Container {
  /**
   *  Public: parses a string representing an array into an Array.
   *
   *  * `val` {String} list string.
   *
   *  Returns {Array}
   */
  list (val) {
    const result = val.replace(/(^(?:"|')?\[)|(](?:"|')?$)/g, '').split(',');
    // This is just a regular comment.
    return result.map((item) => item.trim().replace(/(^(?:"|')?)|((?:"|')?$)/g, ''));
  }
}

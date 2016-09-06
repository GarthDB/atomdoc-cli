/**
 * Private: checks if a node is a decendant of an [AtRule](http://api.postcss.org/AtRule.html).
 *
 * * `node` {Object} PostCSS Node to check.
 *
 * ## Examples
 *
 * ```js
 * const atRule = postcss.parse('@media (min-width: 480px) {a{}}').first;
 * const rule = atRule.first;
 * _isAtruleDescendant(rule); // returns '(min-width: 480px)'
 * ```
 *
 * Returns {Boolean} of false, or {String} of AtRule params if true.
 */
function _isAtruleDescendant(node) {
  let { parent } = node;
  let descended = false;

  while (parent && parent.type !== 'root') {
    if (parent.type === 'atrule') {
      descended = parent.params;
    }
    parent = parent.parent;
  }
  return descended;
}

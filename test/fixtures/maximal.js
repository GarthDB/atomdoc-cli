/**
 *  Public: My awesome method that does stuff.
 *
 *  It does things and stuff and even more things, this is the description. The
 *  next section is the arguments. They can be nested. Useful for explaining the
 *  arguments passed to any callbacks.
 *
 *  * `count` {Number} representing count
 *  * `callback` {Function} that will be called when finished
 *    * `options` Options {Object} passed to your callback with the options:
 *      * `someOption` A {Bool}
 *      * `anotherOption` Another {Bool}
 *
 *  ## Events
 *
 *  ### contents-modified
 *
 *  Public: Fired when this thing happens.
 *
 *  * `options` {Object} An options hash
 *    * `someOption` {Object} An options hash
 *
 *  ## Examples
 *
 *  This is an example. It can have a description.
 *
 *  ```coffee
 *  myMethod 20, ({someOption, anotherOption}) ->
 *    console.log someOption, anotherOption
 *  ```
 *
 *  Returns null in some cases
 *  Returns an {Object} with these keys:
 *    * `someBool` a {Boolean}
 *    * `someNumber` a {Number}
 */
function myMethod(count, callback){
  const result = callback('some option', 'another option');
  if(!result)
    return count;
  else
    return result;
}

export default class Poop {
  /**
   *  Public: makes a new poop instance
   *
   *  * `notTest` {String} literally any string.
   *
   *  ## Examples
   *
   *  Super easy to use:
   *
   *  ```js
   *  const poop = new Poop('a test');
   *  ```
   */
  constructor(test) {
    this.test = test;
  }
}

let newVarFunction = function (param) {
  console.log(param);
}

/**
 *  Public: another function
 *
 *  ## Examples
 *
 *  This is a basic file thing
 *
 *  ```js
 *  file();
 *  ```
 *
 *  Returns {Boolean} true
 */
function file() {
  return true;
}

class Sample {
  /**
   *  Public: creates a new Sample instance
   *
   *  * `prop` {String} a string
   *
   *  ## Examples
   *
   *  A basic class and stuff.
   *
   *  ```js
   *  const sample = new Sample('tada');
   *  console.log(sample.upperCase);
   *  ```
   */
  constructor(prop) {
    this.prop = prop;
  }
  /**
   *  Public: upperCase()
   *
   *  ## Examples
   *
   *  Get the upper case.
   *
   *  ```js
   *  const sample = new Sample('tada');
   *  console.log(sample.upperCase);
   *  ```
   *
   *  Returns {String} Upper case of prop
   */
  get upperCase() {
    return this.prop.toUpperCase();
  }
}

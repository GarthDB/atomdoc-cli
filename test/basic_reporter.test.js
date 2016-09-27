/* eslint-disable import/no-extraneous-dependencies */
import test from 'ava';
// import fs from 'fs';
import nixt from 'nixt';

// function read(filepath) {
//   return fs.readFileSync(filepath, 'utf-8').trim();
// }

test.cb('should return basic report', t => {
  nixt()
  .expect((result) => {
    const expected = `newFunc
  Name: newFunc
  Class: false
  Argument Count: 2
  Argument Name: param1
  Argument Name: param2
  Argument Optional: Add optional to argument description:
    * \`param2\` (optional) {Object}…
  Return: true

anotherFun
  Function on line 13 is missing documentation.

Poop.constructor
  Name: constructor
  Class: Poop
  Argument Count: 1false
  Argument Name: testfalse
  Return: false

newVarFunction
  Function on line 27 is missing documentation.

objectFunction
  Name: objectFunction
  Class: false
  Argument Count: 3
  Argument Name: node
  Argument Name: arr
  Argument Name: returnsArr
  Return: false`;
    t.is(result.stdout.trim(), expected);
  })
  .run('atomdoc ./fixtures/inspection_test.js')
  .end(t.end);
});

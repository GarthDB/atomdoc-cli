/* eslint-disable no-console */
import cliff from 'cliff';
import chalk from 'chalk';

const missing = chalk.red;
const complete = chalk.green;
const headerMissing = missing.inverse;
const headerComplete = complete.inverse;

/**
 *  Private: creates the header string for the report on each method.
 *
 *  * `method` {InspectorMethod} that has the `name` and `className` (optional) properties.
 *  * `filename` {String} the filename or path for the `method`.
 *
 *  Returns {String} to use as the header for method report.
 */
function _formatHeader(method, filename) {
  let header = `${filename} `;
  if (method.className) header += chalk.underline.bold(`${method.className}.`);
  header += chalk.underline.bold(method.name);
  return header;
}

/**
 *  Comparison Class
 */
class Comparison {
  /**
   *  Public: a class to contain the properties to compare and the method to comare
   *  them. A {Bool} of the comparison results is assigned to the instance property
   *  `match` and a message is assigned to `message`.
   *
   *  * `label` {String} prepends the results of the comparison.
   *  * `val1` {String} value to be compared against `val2`.
   *  * `val2` {String} value to be compared against `val2`.
   *  * `validMessage` {String} message to be displayed if `val1 === val2`.
   *  * `invalidMessage` (optional) {Bool|String} message to be displayed if `val1 !== val2`.
   *    If false, it will show both values as the `message`.
   *
   *  ## Examples
   *
   *  ```js
   *  const comp = new Comparison('Really?', 'yes', 'no', 'TADA!', 'not a chance.');
   *  comp.match; // false
   *  comp.message: // 'Really?: not a chance.'
   *  ```
   */
  constructor(label, val1, val2, validMessage, invalidMessage = false) {
    Object.assign(this, {
      label, val1, val2, validMessage, invalidMessage,
    });
    this.val1 = val1 || false;
    this.val2 = val2 || false;
    Object.assign(this, this.compare());
  }
  /**
   *  Private: compares the values and generates the report. This is run automatically
   *  by the constructor and shouldn't need to be called by any outside function unless
   *  the instance properties are changed.
   *
   *  Returns {Object} with params:
   *    * `match` {Bool} results of the comparison.
   *    * `message` a styled {String} with a result message of the comparison.
   */
  compare() {
    const match = Boolean(this.val1 === this.val2);
    const styleFun = (match) ? this.complete : this.missing;
    if (!match) process.exitCode = 1;
    let message = [`${this.label}:`, styleFun(this.validMessage), ''];
    if (!match && this.invalidMessage) {
      message = [`${this.label}:`, this.invalidMessage, ''];
    } else if (!match) {
      message = [`${this.label}:`, headerComplete(this.val1), headerMissing(this.val2)];
    }
    return { match, message };
  }
  /**
   *  Private: a wrapper for styling error text.
   *
   *  * `message` {String} to style.
   *
   *  Returns styled {String}.
   */
  missing(message) {
    return missing(message);
  }
  /**
   *  Private: a wrapper for styling correct text.
   *
   *  * `message` {String} to style.
   *
   *  Returns styled {String}.
   */
  complete(message) {
    return complete(message);
  }
}

/**
 *  Private: using the `definitionLine` this function finds the matching AtomDoc Document.
 *
 *  * `parserResult` {Array} of AtomDoc {Doc} results.
 *  * `definitionLine` {Int} the line the function is defined.
 *
 *  Returns AtomDoc {Doc} that matches the `definitionLine`.
 */
function _findAtomdoc(parserResult, definitionLine) {
  return parserResult.find(method => Boolean(method.definitionLine === definitionLine));
}

/**
 *  Public: compares values in the `parserResult` against the `inspectorResult` of
 *  `result` to determine if the documentation is complete.
 *
 *  * `result` {Result} of the inspection and parsing.
 *  * `showAll` (optional) {Boolean} if true this will show all results, if false,
 *    it will only show errors. Defaults to true.
 *
 *  ## Examples
 *
 *  ```js
 *  const doc = new AtomDocDocument(content);
 *  doc.parse().then((result) => {
 *    basicReport(result, false); // uses `console.log()` to display report.
 *  });
 *  ```
 *
 *  Returns {Array} of comparison errors.
 */
export default function basicReport(result, showAll = true) {
  const fileReports = [];
  result.inspectorResult.forEach((method) => {
    const headerText = _formatHeader(method, result.filename);
    let headerStyle = headerComplete;
    const atomDocMethod = _findAtomdoc(result.parserResult, method.definitionLine);
    if (!atomDocMethod) {
      headerStyle = headerMissing;
      console.log(headerStyle(`${headerText} line ${method.definitionLine}`));
      console.log(missing(
        `Function on line ${method.definitionLine} is missing documentation.\n`
      ));
      process.exitCode = 1;
      return;
    }
    if (!{}.hasOwnProperty.call(atomDocMethod, 'arguments')) atomDocMethod.arguments = [];
    if (!{}.hasOwnProperty.call(atomDocMethod, 'returnValues')) atomDocMethod.returnValues = [];
    const validationArr = [
      new Comparison('Name', method.name, atomDocMethod.name, method.name),
      new Comparison('Class', method.className, atomDocMethod.className, method.className),
      new Comparison('Arg Count', method.args.length,
        atomDocMethod.arguments.length, method.args.length),
    ];
    method.args.forEach((arg, index) => {
      const atomArg = atomDocMethod.arguments[index] || false;
      validationArr.push(
        new Comparison('Arg Name', arg.name, atomArg.name, arg.name)
      );
      if (arg.optional) {
        validationArr.push(
          new Comparison('Arg Optional', arg.optional, atomArg.isOptional, arg.optional,
            missing(`Add (optional) to ${atomArg.name}`)
          )
        );
      }
    });
    validationArr.push(
      new Comparison('Return', Boolean(method.returns.length),
        Boolean(atomDocMethod.returnValues.length), Boolean(method.returns.length))
    );
    const report = [];
    validationArr.forEach((comparison) => {
      if (!comparison.match) {
        headerStyle = headerMissing;
        report.push(comparison.message);
      } else if (showAll) {
        report.push(comparison.message);
      }
    });
    if (atomDocMethod.visibility === 'Public') {
      if (!atomDocMethod.examples) {
        headerStyle = headerMissing;
        report.push(['Examples:', missing('Missing'), 'Add `## Examples` to public methods']);
        process.exitCode = 1;
      } else if (showAll) {
        report.push(['Examples:', complete(atomDocMethod.examples.length), '']);
      }
    }
    if (report.length || showAll) {
      console.log(
        headerStyle(`${headerText} (${atomDocMethod.visibility}) line ${method.definitionLine}`)
      );
      console.log(`${cliff.stringifyRows(report)}\n`);
    }
    fileReports.push(...report);
  });
  if (fileReports.length === 0) {
    console.log(complete(`No missing AtomDocs in ${result.filename}\n`));
  }
  return fileReports;
}

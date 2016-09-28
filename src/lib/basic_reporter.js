/* eslint-disable no-console */
import cliff from 'cliff';
import chalk from 'chalk';

const missing = chalk.red;
const complete = chalk.green;
const headerMissing = missing.inverse;
const headerComplete = complete.inverse;

function _formatHeader(method, filename) {
  let header = `${filename} `;
  if (method.className) header += chalk.underline.bold(`${method.className}.`);
  header += chalk.underline.bold(method.name);
  return header;
}

class Comparison {
  constructor(label, val1, val2, validMessage, invalidMessage = false) {
    Object.assign(this, {
      label, val1, val2, validMessage, invalidMessage,
    });
    this.val1 = val1 || false;
    this.val2 = val2 || false;
    Object.assign(this, this.compare());
  }
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
  missing(message) {
    return missing(message);
  }
  complete(message) {
    return complete(message);
  }
}

function _findAtomdoc(parserResult, definitionLine) {
  return parserResult.find(method => Boolean(method.definitionLine === definitionLine));
}

export default function basicReport(result, showAll = true) {
  result.inspectorResult.forEach((method) => {
    const headerText = _formatHeader(method, result.filename);
    let headerStyle = headerComplete;
    const atomDocMethod = _findAtomdoc(result.parserResult, method.definitionLine);
    if (!atomDocMethod) {
      headerStyle = headerMissing;
      console.log(headerStyle(headerText));
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
      console.log(headerStyle(`${headerText} (${atomDocMethod.visibility})`));
      console.log(`${cliff.stringifyRows(report)}\n`);
    } else if (!showAll && report.length === 0) {
      console.log(complete(`No missing AtomDocs in ${result.filename}`));
    }
  });
}

/* eslint-disable no-console */
import chalk from 'chalk';

const missing = chalk.red;
// const incomplete = chalk.yellow;
const complete = chalk.green;
const headerMissing = chalk.bgRed.black;
const headerIncomplete = chalk.bgYellow.black;
const headerComplete = chalk.bgGreen.black;

function _truncate(string, n) {
  const isTooLong = string.length > n;
  let s = isTooLong ? string.substr(0, n - 1) : this;
  s = (isTooLong) ? s.substr(0, s.lastIndexOf(' ')) : s;
  return isTooLong ? `${s}…` : s;
}


class Comparison {
  constructor(label, val1, val2, validMessage, invalidMessage = false, dependentLabel = false) {
    Object.assign(this, {
      label, val1, val2, validMessage, invalidMessage, dependentLabel,
    });
    this.val1 = val1 || false;
    this.val2 = val2 || false;
    Object.assign(this, this.compare());
  }
  compare() {
    const match = Boolean(this.val1 === this.val2);
    const styleFun = (match) ? this.complete : this.missing;
    let message = this.validMessage;
    if (!match && this.invalidMessage) {
      message = this.invalidMessage;
    } else if (!match) {
      message = `${headerComplete(this.val1)}${headerMissing(this.val2)}`;
    }
    const fullMessage = `${this.label}: ${styleFun(message)}`;
    return { match, message: fullMessage };
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

export default function basicReport(result) {
  result.inspectorResult.forEach((method) => {
    const headerText = (method.className) ? `${method.className}.${method.name}` : method.name;
    let headerStyle = headerComplete;
    const atomDocMethod = _findAtomdoc(result.parserResult, method.definitionLine);
    if (!atomDocMethod) {
      headerStyle = headerMissing;
      console.log(headerStyle(headerText));
      console.log(missing(
        `  Function on line ${method.definitionLine} is missing documentation.\n`
      ));
      return;
    }
    if (!{}.hasOwnProperty.call(atomDocMethod, 'arguments')) atomDocMethod.arguments = [];
    if (!{}.hasOwnProperty.call(atomDocMethod, 'returnValues')) atomDocMethod.returnValues = [];
    const validationArr = [
      new Comparison('Name', method.name, atomDocMethod.name, method.name),
      new Comparison('Class', method.className, atomDocMethod.className, method.className),
      new Comparison('Argument Count', method.args.length,
        atomDocMethod.arguments.length, method.args.length),
    ];
    method.args.forEach((arg, index) => {
      const atomArg = atomDocMethod.arguments[index] || false;
      validationArr.push(
        new Comparison('Argument Name', arg.name, atomArg.name, arg.name)
      );
      if (arg.optional) {
        validationArr.push(
          new Comparison('Argument Optional', arg.optional, atomArg.isOptional, arg.optional,
          `Add optional to argument description:
    * \`${atomArg.name}\` (optional) ${_truncate(atomArg.description, 10)}`
          )
        );
      }
    });
    validationArr.push(
      new Comparison('Return', Boolean(method.returns.length),
        Boolean(atomDocMethod.returnValues.length), Boolean(method.returns.length))
    );
    let report = '';
    validationArr.forEach((comparison) => {
      if (!comparison.match) headerStyle = headerIncomplete;
      report += `  ${comparison.message}\n`;
    });
    console.log(headerStyle(headerText));
    console.log(report);
  });
}

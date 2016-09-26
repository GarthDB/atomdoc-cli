/* eslint-disable no-console */
import chalk from 'chalk';

const missing = chalk.red;
const incomplete = chalk.yellow;
const complete = chalk.green;
const headerMissing = chalk.bgRed.black;
const headerIncomplete = chalk.bgYellow.black;
const headerComplete = chalk.bgGreen.black;


class Comparison {
  constructor(label, val1, val2, validMessage, invalidMessage = false, dependentLabel = false) {
    Object.assign(this, {
      label, val1, val2, validMessage, invalidMessage, dependentLabel,
    });
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
    const atomDocMethod = _findAtomdoc(result.parserResult, method.definitionLine);
    if (!{}.hasOwnProperty.call(atomDocMethod, 'arguments')) atomDocMethod.arguments = [];
    if (!{}.hasOwnProperty.call(atomDocMethod, 'returnValues')) atomDocMethod.returnValues = [];
    const validationArr = [
      new Comparison('Name', method.name, atomDocMethod.name, method.name),
      new Comparison('Class', method.parentClass, atomDocMethod.className, method.parentClass),
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
          new Comparison('Argument Optional', arg.optional, atomArg.isOptional, arg.optional)
        );
      }
    });
    validationArr.push(
      new Comparison('Return', Boolean(method.returns.length),
        Boolean(atomDocMethod.returnValues.length), Boolean(method.returns.length))
    );
    let headerStyle = headerComplete;
    let report = '';
    const headerText = (method.parentClass) ? `${method.parentClass}.${method.name}` : method.name;
    validationArr.forEach((comparison) => {
      if (!comparison.match) headerStyle = headerMissing;
      report += `\n${comparison.message}`;
    });
    console.log(headerStyle(headerText));
    console.log(report.trim());
  });
}

/* eslint-disable no-console */
import chalk from 'chalk';

const missing = chalk.red;
const incomplete = chalk.yellow;
const complete = chalk.green;

export default function basicReport(result) {
  result.parserResult.forEach((method) => {
    console.log(missing(method.name));
    console.log(complete(method.visibility));
    console.log(incomplete('yellow'));
  });
}

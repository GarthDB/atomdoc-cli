module.exports = function consoleReporter(result) {
  console.log(JSON.stringify(result.parserResult, null, 2).trim());
  console.log('from console reporter');
}

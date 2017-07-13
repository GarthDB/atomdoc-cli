module.exports = function consoleReporter(comparison) {
  var result = JSON.stringify(comparison.result.parserResult, null, 2).trim();
  result += '\nfrom console reporter';
  return result;
}

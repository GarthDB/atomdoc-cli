const cliff = require('cliff');
const chalk = require('chalk');

const missing = chalk.red;
const complete = chalk.green;
const headerMissing = missing.inverse;
const headerComplete = complete.inverse;

/**
 *  Private: formats comparison with correct coloring
 *
 *  * `label` {String}
 *  * `basicComparison` {BasicComparison}
 *
 *  Returns {String} formatted
 */
function _formatComparison(label, basicComparison) {
  const style = basicComparison.valid ? complete : missing;
  return [
    style(label),
    basicComparison.inspectorValue,
    basicComparison.atomDocValue,
  ];
}

/**
 *  Private: formats report from paramReport.
 *
 *  * `paramReport` {ParamReport}
 *  * `verbose` (optional) {Boolean} if true, it returns all reports.
 *
 *  Returns {Array} when there are lines to add to report.
 *  Returns {Boolean} (false) when there isn't anything to add to the report.
 *
 */
function _formatParam(paramReport, verbose = false) {
  if (paramReport.valid && verbose) {
    const result = [
      [complete('Arg:'), `${paramReport.atomDocArg.name} is complete`, ''],
    ];
    if (paramReport.hasChildren) {
      result.push(['Nested Params:']);
      return paramReport.childrenReports.reduce(
        (collector, paramChildReport) => {
          const paramResult = _formatParam(paramChildReport, verbose);
          return collector.concat(paramResult);
        },
        result
      );
    }
    return result;
  } else if (paramReport.valid) {
    return false;
  }
  const result = [];
  if (!paramReport.nameMatch.valid) {
    result.push([
      missing('Arg Name:'),
      paramReport.nameMatch.inspectorValue,
      paramReport.nameMatch.atomDocValue,
    ]);
  }
  if (!paramReport.optionalMatch.valid) {
    result.push([
      missing('Arg Optional:'),
      'Missing',
      `Add (optional) to ${paramReport.atomDocArg.name}`,
    ]);
  }
  if (paramReport.hasChildren) {
    result.push(['Nested Params:']);
    return paramReport.childrenReports.reduce((collector, paramChildReport) => {
      const paramResult = _formatParam(paramChildReport, verbose);
      if (paramResult !== false) {
        return collector.concat(paramResult);
      }
      return collector;
    }, result);
  }
  return result;
}

/**
 *  Public: Creates a report to be output to console.
 *
 *  * `comparison` {Comparison}
 *  * `filename` (optional) {String} if provided it will include the filename in the report.
 *  * `verbose` (optional) {Boolean} if true, the report will show passing and failing results.
 *
 *  ## Examples
 *
 *  ```js
 *  BasicReporter(comparisonResult, filepath, verbose);
 *  ```
 *
 *  Returns {String} report.
 */
function BasicReporter(comparison, filename = '', verbose = false) {
  const reports = comparison.reports.reduce((reportCollector, methodReport) => {
    const inspectorMethod = methodReport.inspectorMethod;
    let headerStyle;
    let headerText = '';
    let report = '';
    let resultLines = [];
    if (filename !== '') headerText += `${filename} `;
    if (inspectorMethod.className)
      headerText += `${inspectorMethod.className}.`;
    headerText += inspectorMethod.name;
    // Missing valid docs
    if (!methodReport.validDocs) {
      headerStyle = headerMissing;
      headerText += ` line ${inspectorMethod.definitionLine}\n`;
      report += headerStyle(headerText);
      report += missing(
        `Function on line ${
          inspectorMethod.definitionLine
        } is missing documentation.`
      );
      reportCollector.push(report);
      return reportCollector;
    }
    // Header
    headerStyle = methodReport.valid ? headerComplete : headerMissing;
    headerText += ` (${methodReport.visibility})`;
    headerText += ` line ${inspectorMethod.definitionLine}\n`;
    if (!methodReport.valid || verbose) {
      report += headerStyle(headerText);
    }
    if (!methodReport.nameMatch.valid || verbose) {
      resultLines.push(_formatComparison('Name:', methodReport.nameMatch));
    }
    if (!methodReport.classNameMatch.valid || verbose) {
      resultLines.push(
        _formatComparison('Class:', methodReport.classNameMatch)
      );
    }
    // Parameters
    methodReport.paramReports.forEach(paramReport => {
      const paramResult = _formatParam(paramReport, verbose);
      if (paramResult !== false) {
        resultLines = resultLines.concat(paramResult);
      }
    });
    // Examples
    if (verbose && methodReport.examplesExist) {
      resultLines.push([
        complete('Examples:'),
        'Exist',
        `count(${methodReport.atomDocMethod.examples.length})`,
      ]);
    } else if (!methodReport.validExamples) {
      resultLines.push([
        missing('Examples:'),
        'Missing',
        'Add `## Examples` to public methods',
      ]);
    }
    if (resultLines.length > 0) {
      report += cliff.stringifyRows(resultLines);
    }
    if (report !== '') {
      reportCollector.push(report);
    }
    return reportCollector;
  }, []);
  const report = reports.join('\n\n');
  return report.trim();
}

module.exports = BasicReporter;

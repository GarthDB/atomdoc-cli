const Doc = require('atomdoc/src/doc');

class BasicComparison {
  /**
   *  Public: creates a comparison to check AtomDoc and Inspector values
   *
   *  * `label` {String} the name of the properties that are being compared.
   *  * `atomDocValue` {String|Object} the value in the AtomDoc to check.
   *  * `inspectorValue` {String|Object} the value from the inspector to check.
   *
   *  ## Examples
   *
   *  ```js
   *  const basicComparison = new BasicComparison('name', this.atomDocArg.name, this.inspectorArg.name);
   *  console.log(basicComparison.valid);
   *  ```
   *
   *  Returns {BasicComparison} instance.
   */
  constructor(label, atomDocValue, inspectorValue) {
    Object.assign(this, {label, atomDocValue, inspectorValue});
  }
  /**
   *  Public: a getter that shows if the compared values are equal.
   *
   *  ## Examples
   *
   *  ```js
   *  const basicComparison = new BasicComparison('name', this.atomDocArg.name, this.inspectorArg.name);
   *  console.log(basicComparison.valid);
   *  ```
   *
   *  Returns a {Boolean}
   */
  get valid() {
    return Boolean(this.atomDocValue === this.inspectorValue);
  }
}

class ParamReport {
  /**
   *  Public: a report comparing the parameters
   *
   *  * `atomDocArg` {Object} AtomDoc argument
   *  * `inspectorArg` {Object} Inspector argument
   *
   *  ## Examples
   *
   *  ```js
   *  const paramReport = new ParamReport(atomDocArg, inspectorArg);
   *  ```
   *
   *  Returns {ParamReport} instance
   */
  constructor(atomDocArg, inspectorArg) {
    Object.assign(this, {atomDocArg, inspectorArg});
    this.childrenReports = [];
  }
  /**
   *  Public: a getter showing if the parameter names match.
   *
   *  ## Examples
   *
   *  ```js
   *  const paramReport = new ParamReport(atomDocArg, inspectorArg);
   *  console.log(ParamReport.nameMatch);
   *  ```
   *
   *  Returns {Boolean}
   */
  get nameMatch() {
    return new BasicComparison(
      'name',
      this.atomDocArg.name,
      this.inspectorArg.name
    );
  }
  /**
   *  Public: a getter showing if the parameter `optional` matches.
   *
   *  ## Examples
   *
   *  ```js
   *  const paramReport = new ParamReport(atomDocArg, inspectorArg);
   *  console.log(ParamReport.optionalMatch);
   *  ```
   *
   *  Returns {Boolean}
   */
  get optionalMatch() {
    return new BasicComparison(
      'optional',
      this.atomDocArg.isOptional,
      this.inspectorArg.optional
    );
  }
  /**
   *  Public: a getter showing if all the parameter comparisons pass or not.
   *
   *  ## Examples
   *
   *  ```js
   *  const paramReport = new ParamReport(atomDocArg, inspectorArg);
   *  console.log(ParamReport.valid);
   *  ```
   *
   *  Returns {Boolean}
   */
  get valid() {
    const tests = [
      this.nameMatch.valid,
      this.optionalMatch.valid,
      this.childrenReports.every(childReport => childReport.valid),
    ];
    return tests.every(test => test);
  }
  /**
   *  Public: a getter telling if the parameter has children.
   *
   *  ## Examples
   *
   *  ```js
   *  const paramReport = new ParamReport(atomDocArg, inspectorArg);
   *  console.log(ParamReport.hasChildren);
   *  ```
   *
   *  Returns {Boolean}
   */
  get hasChildren() {
    return this.childrenReports.length > 0;
  }
}
/**
 *  Private: brings all the param reports together
 *
 *  * `atomDocArgs` {Array} of args from AtomDoc
 *  * `inspectorArgs` {Array} of args from the inspector
 *
 *  Returns {Array} of reports with children reports.
 */
function _generateParamReports(atomDocArgs, inspectorArgs) {
  const paramReports = atomDocArgs.map((atomDocArg, index) => {
    const inspectorArg = inspectorArgs[index];
    const paramReport = new ParamReport(atomDocArg, inspectorArg);
    if (atomDocArg.children) {
      paramReport.childrenReports = _generateParamReports(
        atomDocArg.children,
        inspectorArg.children
      );
    }
    return paramReport;
  });
  return paramReports;
}
/**
 *  Private: counts arguments and children arguments
 *
 *  * `parent` {Object} parent argument
 *  * `childLabel` (optional) {String} the label used for children.
 *  * `count` (optional) {Number} the starting count (used for recursive counting)
 *
 *  Returns {Number} an int count
 */
function _countArgs(parent, childLabel = 'args', count = 0) {
  if (!{}.hasOwnProperty.call(parent, childLabel)) return count;
  let resultCount = count;
  parent[childLabel].forEach(arg => {
    resultCount++;
    resultCount += _countArgs(arg, 'children');
  });
  return resultCount;
}

class MethodReport {
  /**
   *  Public: a comparison report for a method.
   *
   *  * `atomDocMethod` {Object} a method report from AtomDoc.
   *  * `inspectorMethod` {Object} a method report from an inspector (falafel)
   *
   *  ## Examples
   *
   *  ```js
   *  const report = new MethodReport(atomDocMethod, inspectorMethod);
   *  ```
   *
   *  Returns {MethodReport} instance.
   */
  constructor(atomDocMethod, inspectorMethod) {
    this.atomDocMethod = atomDocMethod;
    this.inspectorMethod = inspectorMethod;
    if (this.validDocs) {
      this.atomDocMethod.arguments = this.atomDocMethod.arguments || [];
      this.paramReports = _generateParamReports(
        atomDocMethod.arguments,
        inspectorMethod.args
      );
    }
  }
  /**
   *  Public: checks if AtomDoc exists for a method.
   *
   *  Also verifies that atomDoc is an instance of {Doc}
   *
   *  ## Examples
   *
   *  ```js
   *  const report = new MethodReport(atomDocMethod, inspectorMethod);
   *  report.validateDocsExist(); //returns true if atomDocMethod exists;
   *  ```
   *
   *  Returns {Boolean}
   */
  get validDocs() {
    if (!this.atomDocMethod) return false;
    return Boolean(this.atomDocMethod instanceof Doc);
  }
  /**
   *  Public: checks if the name of the function matches the atomdoc method name.
   *
   *  ## Examples
   *
   *  ```js
   *  const report = new MethodReport(atomDocMethod, inspectorMethod);
   *  console.log(report.nameMatch); // true if atomDocMethod exists;
   *  ```
   *
   *  Returns {Boolean}
   */
  get nameMatch() {
    return new BasicComparison(
      'name',
      this.atomDocMethod.name,
      this.inspectorMethod.name
    );
  }
  /**
   *  Public: returns the visibility of the method.
   *
   *  ## Examples
   *
   *  ```js
   *  const report = new MethodReport(atomDocMethod, inspectorMethod);
   *  report.visibility; // Public|Private;
   *  ```
   *
   *  Returns {String} Public or Private
   */
  get visibility() {
    return this.atomDocMethod.visibility;
  }
  /**
   *  Public: a boolean that shows whether examples are in the AtomDoc.
   *
   *  ## Examples
   *
   *  ```js
   *  const report = new MethodReport(atomDocMethod, inspectorMethod);
   *  report.examplesExist; // true|false;
   *  ```
   *
   *  Returns {Boolean}
   */
  get examplesExist() {
    return Boolean(this.atomDocMethod.examples);
  }
  /**
   *  Public: a boolean that shows whether the AtomDoc classname and Inspector classname match.
   *
   *  ## Examples
   *
   *  ```js
   *  const report = new MethodReport(atomDocMethod, inspectorMethod);
   *  report.classNameMatch; // true|false;
   *  ```
   *
   *  Returns {Boolean}
   */
  get classNameMatch() {
    return new BasicComparison(
      'className',
      this.atomDocMethod.className,
      this.inspectorMethod.className
    );
  }
  /**
   *  Public: a boolean validates if examples exist if it is public.
   *
   *  ## Examples
   *
   *  ```js
   *  const report = new MethodReport(atomDocMethod, inspectorMethod);
   *  report.validExamples; // true|false;
   *  ```
   *
   *  Returns {Boolean}
   */
  get validExamples() {
    if (this.visibility === 'Public') {
      return Boolean(this.examplesExist);
    }
    return true;
  }
  /**
   *  Public: the argument count for the method.
   *
   *  ## Examples
   *
   *  ```js
   *  const report = new MethodReport(atomDocMethod, inspectorMethod);
   *  report.argCountMatch;
   *  ```
   *
   *  Returns {Number}
   */
  get argCountMatch() {
    const inspectorArgCount = _countArgs(this.inspectorMethod);
    const atomDocArgCount = _countArgs(this.atomDocMethod, 'arguments');
    return new BasicComparison('ArgCount', atomDocArgCount, inspectorArgCount);
  }
  /**
   *  Public: the result of all validation tests.
   *
   *  ## Examples
   *
   *  ```js
   *  const report = new MethodReport(atomDocMethod, inspectorMethod);
   *  report.valid;
   *  ```
   *
   *  Returns {Boolean} true if all tests pass.
   */
  get valid() {
    const tests = [
      this.validDocs,
      this.nameMatch.valid,
      this.classNameMatch.valid,
      this.paramReports.every(paramReport => paramReport.valid),
      this.validExamples,
    ];
    return tests.every(test => test);
  }
}

class Comparison {
   /**
    *  Public: comparison of AtomDoc and Inspector reports.
    *
    *  * `result` {Result} from the AtomDocDocument.process();
    *
    *  ## Examples
    *
    *  ```js
    *  const comparison = new Comparison(result);
    *  ```
    *
    *  Returns {Comparison} instance.
    */
  constructor(result) {
    this.result = result;
    this.reports = [];
    this.result.inspectorResult.forEach(method => {
      const atomDocMethod = this.result.findAtomDoc(method.definitionLine);
      this.reports.push(new MethodReport(atomDocMethod, method));
    });
  }
  /**
   *  Public: getter of the comparison of all the values
   *
   *  ## Examples
   *
   *  ```js
   *  const comparison = new Comparison(result);
   *  console.log(comparison.valid);
   *  ```
   *
   *  Returns {Boolean} true if all the reports are valid.
   */
  get valid() {
    return this.reports.every(report => report.valid);
  }
}

module.exports = {Comparison, BasicComparison, MethodReport};

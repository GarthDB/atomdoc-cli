import Doc from 'atomdoc/lib/doc';

export class Comparison {
  constructor(label, atomDocValue, inspectorValue) {
    Object.assign(this, { label, atomDocValue, inspectorValue });
  }
  get valid() {
    return Boolean(this.atomDocValue === this.inspectorValue);
  }
}

class ParamReport {
  constructor(atomDocArg, inspectorArg) {
    Object.assign(this, { atomDocArg, inspectorArg });
    this.childrenReports = [];
  }
  get nameMatch() {
    return new Comparison('name', this.atomDocArg.name, this.inspectorArg.name);
  }
  get optionalMatch() {
    return new Comparison('optional', this.atomDocArg.isOptional, this.inspectorArg.optional);
  }
  get valid() {
    const tests = [
      this.nameMatch.valid,
      this.optionalMatch.valid,
      this.childrenReports.every((childReport) => childReport.valid),
    ];
    return tests.every((test) => test);
  }
}

function _generateParamReports(atomDocArgs, inspectorArgs) {
  const paramReports = atomDocArgs.map((atomDocArg, index) => {
    const inspectorArg = inspectorArgs[index];
    const paramReport = new ParamReport(atomDocArg, inspectorArg);
    if (atomDocArg.children) {
      paramReport.childrenReports = _generateParamReports(
        atomDocArg.children, inspectorArg.children
      );
    }
    return paramReport;
  });
  return paramReports;
}

export class MethodReport {
  constructor(atomDocMethod, inspectorMethod) {
    this.atomDocMethod = atomDocMethod;
    this.inspectorMethod = inspectorMethod;
    if (this.validDocs) {
      this.paramReports = _generateParamReports(atomDocMethod.arguments, inspectorMethod.args);
    }
  }
  /**
   *  Public: checks if AtomDoc exists for a method.
   *
   *  Also verifies that atomDoc is an instance of {Doc}
   *
   *  Returns {Boolean}
   *
   *  ## Examples
   *
   *  ```js
   *  const report = new MethodReport(atomDocMethod, inspectorMethod);
   *  report.validateDocsExist(); //returns true if atomDocMethod exists;
   *  ```
   */
  get validDocs() {
    if (!this.atomDocMethod) return false;
    return Boolean(this.atomDocMethod instanceof Doc);
  }
  /**
   *  Public: checks if the name of the function matches the atomdoc method name.
   *  Returns {Boolean}
   *
   *  ```js
   *  const report = new MethodReport(atomDocMethod, inspectorMethod);
   *  report.validateNameMatch(); //returns true if atomDocMethod exists;
   *  ```
   */
  get nameMatch() {
    return new Comparison('name', this.atomDocMethod.name, this.inspectorMethod.name);
  }
  get visibility() {
    return this.atomDocMethod.visibility;
  }
  get examplesExist() {
    return Boolean(this.atomDocMethod.examples);
  }
  get classNameMatch() {
    return new Comparison('className',
      this.atomDocMethod.className, this.inspectorMethod.className);
  }
  get validExamples() {
    if (this.visibility === 'Public') {
      return Boolean(this.examplesExist);
    }
    return true;
  }
  get valid() {
    const tests = [
      this.validDocs,
      this.nameMatch,
      this.classNameMatch,
      this.paramReports.every((paramReport) => paramReport.valid),
      this.validExamples,
    ];
    return tests.every((test) => test);
  }
}

export default class Comparer {
  constructor(result) {
    this.result = result;
    this.reports = [];
    this.result.inspectorResult.forEach((method) => {
      const atomDocMethod = this.result.findAtomDoc(method.definitionLine);
      this.reports.push(new MethodReport(atomDocMethod, method));
    });
  }
  get valid() {
    return this.reports.every((report) => report.valid);
  }
}

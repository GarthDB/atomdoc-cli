import Doc from 'atomdoc/lib/doc';

class Comparison {
  constructor (label, atomDocValue, inspectorValue){
    Object.assign(this, {label, atomDocValue, inspectorValue});
  }
  get valid() {
    return Boolean(this.atomDocValue === this.inspectorValue);
  }
}

export class MethodReport {
  constructor(atomDocMethod, inspectorMethod) {
    this.atomDocMethod = atomDocMethod;
    this.inspectorMethod = inspectorMethod;
    this.paramReports = [];
    // this.docsExist = this.validateDocsExist();
    // this.nameMatch = this.validateNameMatch();
    // this.classNameMatch = this.validateClassNameMatch();
  }
  addParamReport(paramReport) {
    this.paramReports.push(paramReport);
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
  get validDocs () {
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
  get nameMatch () {
    return new Comparison('name', this.atomDocMethod.name, this.inspectorMethod.name);
  }
  get validExamples () {
    if(this.atomDocMethod.visibility === 'Public' && this.atomDocMethod.examples) console.log('present');
    console.log(this.atomDocMethod.visibility);
    console.log(this.atomDocMethod.examples);
  }
  validateClassNameMatch() {

  }
  validateParamReports() {

  }
}
class ParamReport {
  constructor() {
    this.nameMatch = true;
    this.optionalMatch = true;
    this.childrenReports = [];
  }
  addChildReport(paramReport) {
    this.paramReports.push(paramReport);
  }
}
export default class Comparer {
  constructor(result) {
    this.result = result;
    this.reports = [];
    this.result.inspectorResult.forEach((method) => {
      const atomDocMethod = this.result.findAtomdoc(method.definitionLine);
      this.reports.push(new MethodReport(atomDocMethod, method));
    });
  }
}

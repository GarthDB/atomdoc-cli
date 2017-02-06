class ReportError {
  constructor(method, message) {
    this.method = method;
    this.line = line;
    this.message = message;
  }
}

class ReportSuccess {

}

class Report {
  constructor() {
    this.reports = [];
    this.valid = true;
  }
  addReport(report) {
    if(report.constructor.name === ReportError.name) this.valid = false;
    this.reports.push(report);
  }
}

_compare(label, val1, val2) {
  let report;
  const match = Boolean(this.val1 === this.val2);
  if (!match) {
    report = new ReportError ()
  } else if (!match) {
    message = [`${this.label}:`, headerComplete(this.val1), headerMissing(this.val2)];
  }
  return { match, message };
}

export default class Comparer {
  constructor(result){
    this.result = result;
  }
  analyze(result = false) {
    if(!result && !this.result) throw Error('Provide a Result object to compare');
    if(result !== false) this.result = result;
    const report = new Report();
    result.inspectorResult.forEach((method) => {
      const atomDocMethod = _findAtomdoc(result.parserResult, method.definitionLine);
      if (!atomDocMethod) {
        report.addReport(new ReportError(method,
          `Function on line ${method.definitionLine} is missing documentation.`
        ));
        return;
      }
      if (!{}.hasOwnProperty.call(atomDocMethod, 'arguments')) atomDocMethod.arguments = [];
      if (!{}.hasOwnProperty.call(atomDocMethod, 'returnValues')) atomDocMethod.returnValues = [];
    }
  }
}

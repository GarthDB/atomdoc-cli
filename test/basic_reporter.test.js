const test = require("ava");
const fs = require("fs");
const basicReporter = require("../src/lib/basic_reporter");
const AtomDocDocument = require("../src/lib/");
const Comparison = require("../src/lib/comparison");

function _trimLines(text) {
  const lines = text.split("\n");
  const result = lines.map((line) => line.trim());
  return result.join("\n");
}

test("should return basic report", (t) => {
  const content = fs.readFileSync("./test/fixtures/basic_reporter.js", "utf-8");
  const doc = new AtomDocDocument(content);
  return doc.process().then((result) => {
    const comparison = new Comparison(result);
    const basic = basicReporter(
      comparison,
      "./test/fixtures/basic_reporter.js"
    );
    const expected = fs.readFileSync(
      "./test/expected/basic_reporter.txt",
      "utf-8"
    );
    t.truthy(_trimLines(basic), expected);
  });
});
test("should return verbose report", (t) => {
  const content = fs.readFileSync("./test/fixtures/basic_reporter.js", "utf-8");
  const doc = new AtomDocDocument(content);
  return doc.process().then((result) => {
    const comparison = new Comparison(result);
    const verbose = basicReporter(
      comparison,
      "./test/fixtures/basic_reporter.js",
      true
    );
    const expected = fs.readFileSync(
      "./test/expected/basic_reporter.verbose.txt",
      "utf-8"
    );
    t.truthy(_trimLines(verbose), expected);
  });
});
test("should compare nested parameters", (t) => {
  const content = fs.readFileSync(
    "./test/fixtures/param-context-matching.js",
    "utf-8"
  );
  const doc = new AtomDocDocument(content);
  return doc.process().then((result) => {
    const comparison = new Comparison(result);
    const basic = basicReporter(
      comparison,
      "./test/fixtures/param-context-matching.js"
    );
    const expected = fs.readFileSync(
      "./test/expected/param-context-matching-report.txt",
      "utf-8"
    );
    t.truthy(_trimLines(basic), expected);
  });
});
test("should compare nested parameters with a verbose report", (t) => {
  const content = fs.readFileSync(
    "./test/fixtures/param-context-matching.js",
    "utf-8"
  );
  const doc = new AtomDocDocument(content);
  return doc.process().then((result) => {
    const comparison = new Comparison(result);
    const verbose = basicReporter(
      comparison,
      "./test/fixtures/param-context-matching.js",
      true
    );
    const expected = fs.readFileSync(
      "./test/expected/param-context-matching-report-verbose.txt",
      "utf-8"
    );
    t.truthy(_trimLines(verbose), expected);
  });
});
test("should return error with no docs", (t) => {
  const content = fs.readFileSync("./test/fixtures/no_docs.js", "utf-8");
  const doc = new AtomDocDocument(content);
  return doc.process().then((result) => {
    const comparison = new Comparison(result);
    const verbose = basicReporter(
      comparison,
      "./test/fixtures/no_docs.js",
      true
    );
    const expected = fs.readFileSync("./test/expected/no_docs.txt", "utf-8");
    t.truthy(_trimLines(verbose), expected);
  });
});

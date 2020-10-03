# AtomDoc CLI

[![Build Status](https://travis-ci.org/GarthDB/atomdoc-cli.svg?branch=master)](https://travis-ci.org/GarthDB/atomdoc-cli)
[![codecov](https://codecov.io/gh/GarthDB/atomdoc-cli/branch/master/graph/badge.svg)](https://codecov.io/gh/GarthDB/atomdoc-cli)
[![Dependency Status](https://david-dm.org/GarthDB/atomdoc-cli.svg)](https://david-dm.org/GarthDB/atomdoc-cli)
[![npm version](https://badge.fury.io/js/atomdoc-cli.svg)](https://badge.fury.io/js/atomdoc-cli)

---

![Console Screenshot](http://garthdb.com/atomdoc-cli/img/console-screenshot.png)
_An example of the command line tool reporting an issue and a verbose output.
The source of the fixture is
[here](https://github.com/GarthDB/atomdoc-cli/blob/00cdb06a5e9420d28d1adac1eed4ae7198c2e47b/test/fixtures/nested_functions.js)._

A JS lib and command line tool to check for missing
[AtomDoc](https://github.com/atom/atomdoc) information in a javascript project.

It inspects js code for functions and methods looking for things like parameters
and return statements then compares that information against the AtomDoc
comments. It highlights potentially missing information and can be used as part
of build validation (like linting or automated tests) in a continuous
integration setup like Travis CI.

AtomDoc is a comment documentation format, created by GitHub. It is based on
markdown, which for many teams, is easier to adopt than more complex formats.
Take a look at GitHub's
[maximal example](https://github.com/atom/atomdoc#maximal-example) for a quick
guide on how to use it.

You can also look at the
[source code](https://github.com/GarthDB/atomdoc-cli/tree/master/src) of this
project to find examples like this one:

````js
export default class AtomDocDocument {
  /**
   *  Public: constructor for AtomDocDocument instance.
   *
   *  * `content` {String} the raw content of the javascript file to be parsed and inspected.
   *
   *  ## Examples
   *
   *  ```js
   *  const content = fs.readFileSync(filepath, 'utf-8');
   *  const doc = new AtomDocDocument(content);
   *  ```
   */
  constructor(content) {
    this.content = content;
  }
  /**
   *  Public: parses javascript document defined by `this.filepath`.
   *
   *  ## Examples
   *
   *  ```js
   *  const content = fs.readFileSync(filepath, 'utf-8');
   *  const doc = new AtomDocDocument(content);
   *  doc.process().then(result => {
   *    result.parserResult;
   *    result.inspectorResult;
   *  });
   *  ```
   *
   *  Returns {Promise} that resolves with a {Result} instance.
   */
  process() {
    const commentParser = new CommentParser();
    const contentParser = new ContentParser(this.content, commentParser);
    const contentInspector = new ContentInspector(this.content);
    falafel(
      this.content,
      {
        sourceType: 'module',
        ecmaVersion: '6',
        onComment: commentParser.parseComment.bind(commentParser),
        locations: true,
        allowHashBang: true,
      },
      node => {
        contentInspector.inspectNode(node);
        contentParser.parseNode(node);
      }
    );
    return Promise.all([contentParser.promise, contentInspector.promise]).then(
      result => new Result(result)
    );
  }
}
````

## Installation

To use the cli just install globally via npm:

```sh
$ npm install -g atomdoc-cli
```

To use as the js api save the install in your project via npm:

```sh
$ npm install --save atomdoc-cli
```

## Usage

### CLI

The help has the basic information for using the command line tool:

```sh
$ atomdoc -h

  Usage: atomdoc <file>

  A CLI interface for AtomDoc

  Options:

    -h, --help                    output usage information
    -V, --version                 output the version number
    -o, --output-path [filename]  Where to write out, defaults to stdout if not specified.
    -r, --reporter [packagename]  Path or package name of a reporter to use
    -v, --verbose                 Show full report, without it, this tool will only show errors
```

#### `--output-path`

The `output-path` flag will write the inspection and parser report to a json
file.

```sh
$ atomdoc ./test/fixtures/class.js --output-path
File ./api.json written.
```

You can also specify the filename/path:

```sh
$ atomdoc ./test/fixtures/class.js --output-path report.json
File report.json written.
```

#### `--reporter`

The default reporter is
[`basic_reporter`](https://github.com/GarthDB/atomdoc-cli/blob/master/lib/basic_reporter.js).
It will be used if no reporter is specified:

```sh
$ atomdoc ./test/fixtures/class.js
./test/fixtures/class.js Container.list (Public) line 9
Examples: Missing Add `## Examples` to public methods
```

You can write your own reporter. It just needs to be a function that expects the
`results`
[{Result}](https://github.com/GarthDB/atomdoc-cli/blob/master/lib/index.js#L9)
and `showAll` [{Bool}] as parameters.

You can also pass in a package name that's installed in the node_modules
directory.

#### `--verbose`

If you want to see passing results as well as errors, just include the `verbose`
flag; otherwise it just shows the failing results.

```sh
$ atomdoc ./test/fixtures/class.js
./test/fixtures/class.js Container.list (Public) line 9
Examples: Missing Add `## Examples` to public methods
```

With the verbose flag:

```sh
$ atomdoc ./test/fixtures/class.js -v
./test/fixtures/class.js Container.list (Public) line 9
Name:      list
Class:     Container
Arg Count: 1
Arg Name:  val
Return:    true
Examples:  Missing   Add `## Examples` to public methods
```

### JS API

This can also be used as a javascript library.

```js
var AtomDocDocument = require('../lib/');

const doc = new AtomDocDocument(content);
doc.process().then(result => {
  result.parserResult; // {Array} of AtomDoc {Doc} objects.
  result.inspectorResult; // {Array} of {InspectorMethod} objects.
});
```

### NPM Script and Continuous Integration

It can also be used as a code verification tool with continuous integration
workflow like Travis CI.

This project uses it right next to eslint and ava tests to validate the build:

In the `package.json` you can add it like this:

```json
"scripts": {
  "test": "nyc ava",
  "lint": "eslint .",
  "checkdocs": "atomdoc src",
  "validate": "npm run lint && npm run test && npm run checkdocs",
},
```

In the `.travis.yml` you can configure the validation:

```yml
language: node_js
node_js: '6'
script:
  - npm run validate
```

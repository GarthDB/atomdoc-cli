import readFile from 'fs-readfile-promise';
import extract from 'extract-comments';
import AtomDoc from 'atomdoc';

const _fixIndent = (str) => {
  const indentRegEx = /^(\s)*/;
  const indent = str.match(indentRegEx)[0];
  if (indent !== '') {
    return str.replace(new RegExp(indent, ['g']), '\n').trim();
  }
  return str;
};

class Result {
  constructor(atomDocs) {
    this.docs = atomDocs;
  }
  toString() {
    return JSON.stringify(this.docs, null, 2);
  }
}

export default class AtomDocDocument {
  constructor(filepath) {
    this.filepath = filepath;
  }
  parse() {
    return readFile(this.filepath).then(buffer => {
      const comments = extract(buffer.toString());
      const atomDocs = [];
      comments.forEach(comment => {
        const value = _fixIndent(comment.value);
        atomDocs.push(AtomDoc.parse(value));
      });
      return new Result(atomDocs);
    });
  }
}

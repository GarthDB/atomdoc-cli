export default function basicReport(result) {
  result.docs.forEach((method) => {
    console.log(method.name);
    console.log(method.visibility);
  });
}

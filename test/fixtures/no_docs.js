function formatComparison(label, basicComparison) {
  const style = (basicComparison.valid) ? complete : missing;
  return [label, style(basicComparison.inspectorValue), style(basicComparison.atomDocValue)];
}

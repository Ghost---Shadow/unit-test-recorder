const InvokeStatement = (props) => {
  const { functionIdentifier, meta } = props;
  const { doesReturnPromise, paramIds } = meta;
  const invokeExpression = `${functionIdentifier}(${paramIds.join(',')})`;

  const awaitString = doesReturnPromise ? 'await ' : '';
  return `const actual = ${awaitString}${invokeExpression}`;
};

module.exports = { InvokeStatement };

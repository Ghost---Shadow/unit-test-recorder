const InvokeStatement = (props) => {
  const { meta } = props;
  const functionIdentifier = meta.name;
  const { doesReturnPromise, paramIds } = meta;
  const invokeExpression = `${functionIdentifier}(${paramIds.join(',')})`;

  const awaitString = doesReturnPromise ? 'await ' : '';
  return `const actual = ${awaitString}${invokeExpression}`;
};

module.exports = { InvokeStatement };

const recorderWrapper = (functionName, innerFunction, ...p) => {
  console.log(functionName, ...p);
  const result = innerFunction(...p);
  console.log(functionName, result);
  return result;
};

module.exports = {
  recorderWrapper,
};

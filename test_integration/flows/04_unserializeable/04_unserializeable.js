const circularReference = (a) => {
  const obj = { a };
  obj.obj = obj;
  return obj;
};

const returnAFunction = (a, f2) => b => a + f2(b);

module.exports = {
  circularReference,
  returnAFunction,
};

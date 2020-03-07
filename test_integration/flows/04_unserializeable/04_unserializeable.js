const circularReference = (a) => {
  const obj = { a };
  obj.obj = obj;
  return obj;
};

// const returnAFunction = a => b => a + b;

module.exports = { circularReference };

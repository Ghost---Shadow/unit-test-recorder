var { recorderWrapper } = require('../../../src/recorder');
const circularReference = (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/04_unserializeable/04_unserializeable.js',
      name: 'circularReference',
      paramIds: 'a',
      isDefault: false,
      isEcmaDefault: false
    },
    a => {
      const obj = { a };
      obj.obj = obj;
      return obj;
    },
    ...p
  );

// const returnAFunction = a => b => a + b;

module.exports = { circularReference };

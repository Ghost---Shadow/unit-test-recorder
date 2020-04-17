const { recordFileMeta } = require('../../../src/recorder');
const { recorderWrapper } = require('../../../src/recorder');
const circularReference = (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/04_unserializeable/04_unserializeable.js',
      name: 'circularReference',
      paramIds: ['a'],
      injectionWhitelist: [],
      isDefault: false,
      isEcmaDefault: false,
      isAsync: false,
      isObject: false
    },
    a => {
      const obj = { a };
      obj.obj = obj;
      return obj;
    },
    ...p
  );

const returnAFunction = (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/04_unserializeable/04_unserializeable.js',
      name: 'returnAFunction',
      paramIds: ['a', 'f2'],
      injectionWhitelist: [],
      isDefault: false,
      isEcmaDefault: false,
      isAsync: false,
      isObject: false
    },
    (a, f2) => b => a + f2(b),
    ...p
  );

const getElapsedTime = (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/04_unserializeable/04_unserializeable.js',
      name: 'getElapsedTime',
      paramIds: ['start', 'end'],
      injectionWhitelist: [],
      isDefault: false,
      isEcmaDefault: false,
      isAsync: false,
      isObject: false
    },
    (start, end) => {
      const y2k = new Date(2000, 1, 1);
      const delta = end.getTime() - start.getTime();
      const result = new Date();
      result.setTime(y2k.getTime() + delta);
      return result;
    },
    ...p
  );

const returnsNaN = (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/04_unserializeable/04_unserializeable.js',
      name: 'returnsNaN',
      paramIds: ['a'],
      injectionWhitelist: [],
      isDefault: false,
      isEcmaDefault: false,
      isAsync: false,
      isObject: false
    },
    a => Number.parseFloat(a),
    ...p
  );

module.exports = {
  circularReference,
  returnAFunction,
  getElapsedTime,
  returnsNaN
};
recordFileMeta({
  path: 'test_integration/flows/04_unserializeable/04_unserializeable.js',
  mocks: []
});

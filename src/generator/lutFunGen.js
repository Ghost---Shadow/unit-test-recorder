const _ = require('lodash');

const captureArrayToLutFun = (captures) => {
  const lut = captures.reduce((acc, capture) => {
    const stringifiedParams = capture.params.map((p) => {
      if (typeof (p) === 'string') return p;
      return JSON.stringify(p);
    });
    const key = stringifiedParams.length === 0 ? undefined : stringifiedParams;
    const newObj = {};
    _.setWith(newObj, key, capture.result, Object);
    return _.merge(acc, newObj);
  }, {});
  const stringifiedLut = JSON.stringify(lut, null, 2);
  const functionWrapper = `
  (...params) => {
    const safeParams = params.length === 0 ? [undefined] : params
    return safeParams.reduce((acc, param) => {
      if(typeof(param) === 'string') return acc[param]
      return acc[JSON.stringify(param)]
    },${stringifiedLut})
  }
  `;
  return functionWrapper;
};

module.exports = { captureArrayToLutFun };

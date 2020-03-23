// https://stackoverflow.com/a/42658586/1217998
const getBlackListForProperty = type => Object
  .getOwnPropertyNames(type.prototype)
  .filter(prop => typeof type.prototype[prop] === 'function');

const getBlackList = () => {
  const types = [Array, String, Object, Number, Date];
  const allProperties = types.reduce((acc, type) => {
    const keys = getBlackListForProperty(type);
    const obj = keys.reduce((innerAcc, key) => ({ ...innerAcc, [key]: true }), {});
    return { ...acc, ...obj };
  }, {});
  return allProperties;
};

module.exports = { getBlackList };

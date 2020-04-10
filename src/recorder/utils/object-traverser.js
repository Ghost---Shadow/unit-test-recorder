const _ = require('lodash');
const { getBlackList } = require('../../plugin/blacklist-generator');
const { inferTypeOfObject } = require('../utils/dynamic-type-inference');

// https://stackoverflow.com/a/44536464/1217998
const isGetter = (obj, prop) => !!_.get(Object.getOwnPropertyDescriptor(obj, prop), 'get');

// Compute once
const bl = getBlackList();

const getKeysForObject = (obj, blacklist) => {
  const appendProto = Object.getPrototypeOf(obj) !== null;
  const toConcat = appendProto ? ['__proto__'] : [];
  return Object.getOwnPropertyNames(obj)
    .filter(k => !blacklist[k])
    .filter(k => !isGetter(obj, k))
    .concat(toConcat);
};

const getKeysForArray = arr => _.range(arr.length);

const isObjectLikeEmpty = (type, keys, path) => {
  const isObjectEmpty = type === 'Object' && keys.length === 1 && keys[0] === '__proto__';
  const isArrayEmpty = type === 'Array' && keys.length === 0;
  return (isObjectEmpty || isArrayEmpty) && path.length;
};

function* traverse(objRoot, blacklist = bl) {
  const stack = [objRoot];
  function* traverseInner(obj, path = []) {
    const type = inferTypeOfObject(obj);
    if (type !== 'Object' && type !== 'Array') {
      if (path.length) {
        // Dont push empty paths
        yield path;
      }
      return;
    }
    const getKeys = {
      Array: getKeysForArray,
      Object: getKeysForObject,
    }[type];
    const keys = getKeys(obj, blacklist);
    if (isObjectLikeEmpty(type, keys, path)) {
      // Retain empty objects and arrays
      yield path;
      return;
    }
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      try {
        const child = obj[key];
        // Cycle found
        if (stack.indexOf(child) !== -1) return;
        stack.push(child);
        yield* traverseInner(child, path.concat(key));
        stack.pop();
      } catch (e) {
        console.error(e);
      }
    }
  }
  yield* traverseInner(objRoot);
}

module.exports = { traverse };

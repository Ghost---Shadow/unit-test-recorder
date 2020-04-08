const _ = require('lodash');
const { getBlackList } = require('../../plugin/blacklist-generator');
// https://stackoverflow.com/a/44536464/1217998
const isGetter = (obj, prop) => !!_.get(Object.getOwnPropertyDescriptor(obj, prop), 'get');

// Compute once
const bl = getBlackList();

const traverse = (objRoot, blacklist = bl) => {
  const result = [];
  const stack = [objRoot];
  const traverseInner = (obj, path = []) => {
    // https://stackoverflow.com/a/13356338/1217998
    if (Object.prototype.toString.call(obj) !== '[object Object]') {
      result.push(path);
      return;
    }
    const appendProto = Object.getPrototypeOf(obj) !== null;
    const toConcat = appendProto ? ['__proto__'] : [];
    const keys = Object.getOwnPropertyNames(obj)
      .filter(k => !blacklist[k])
      .concat(toConcat);
    keys.forEach((key) => {
      try {
        // Ignore getters
        if (isGetter(obj, key)) return;
        const child = obj[key];
        // Cycle found
        if (stack.indexOf(child) !== -1) return;
        stack.push(child);
        traverseInner(child, path.concat(key));
        stack.pop();
      } catch (e) {
        console.error(e);
      }
    });
  };
  traverseInner(objRoot);
  return result;
};

module.exports = { traverse };

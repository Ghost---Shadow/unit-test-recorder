const traverse = (objRoot) => {
  const result = [];
  const traverseInner = (obj, path = []) => {
    // https://stackoverflow.com/a/13356338/1217998
    if (Object.prototype.toString.call(obj) !== '[object Object]') {
      result.push(path);
      return;
    }
    const appendProto = Object.getPrototypeOf(obj) !== null;
    const toConcat = appendProto ? ['__proto__'] : [];
    const keys = Object.keys(obj).concat(toConcat);
    keys.forEach((key) => {
      traverseInner(obj[key], path.concat(key));
    });
  };
  traverseInner(objRoot);
  return result;
};

module.exports = { traverse };

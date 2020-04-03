const traverse = (objRoot) => {
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
    const keys = Object.keys(obj).concat(toConcat);
    keys.forEach((key) => {
      try {
        const child = obj[key];
        // Cycle found
        if (stack.indexOf(child) !== -1) return;
        stack.push(child);
        // Getter function exists but it throws exception
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

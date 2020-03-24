const safeStringify = (obj) => {
  // https://stackoverflow.com/a/11616993/1217998
  const cache = [];
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.indexOf(value) !== -1) {
        // Duplicate reference found, discard key
        return undefined;
      }
      // Store value in our collection
      cache.push(value);
    }
    return value;
  }, 2);
};

module.exports = { safeStringify };

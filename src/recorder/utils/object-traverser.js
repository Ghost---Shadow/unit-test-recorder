const _ = require('lodash');
const { getBlackList } = require('../../plugin/blacklist-generator');
const { inferTypeOfObject } = require('../utils/dynamic-type-inference');

const UTR_DEFAULT_STACK_DEPTH = 7;
const getMaxStackDepth = () => {
  // Arbitarily chosen number
  try {
    return JSON.parse(process.env.UTR_STACK_DEPTH);
  } catch (e) {
    return UTR_DEFAULT_STACK_DEPTH;
  }
};

// https://stackoverflow.com/a/44536464/1217998
const isGetter = (obj, prop) => !!_.get(Object.getOwnPropertyDescriptor(obj, prop), 'get');

// Compute once
const bl = getBlackList();

const getKeysForObject = (obj, crawlProto, blacklist) => {
  const appendProto = Object.getPrototypeOf(obj) !== null && crawlProto;
  const toConcat = appendProto ? ['__proto__'] : [];
  const validKeys = Object.getOwnPropertyNames(obj)
    .filter(k => !blacklist[k])
    .filter(k => !isGetter(obj, k));
  return toConcat.concat(validKeys);
};

const getKeysForArray = arr => _.range(arr.length);

const isObjectLikeEmpty = (type, keys, path) => {
  const isObjectEmpty = type === 'Object' && keys.length === 1 && keys[0] === '__proto__';
  const isArrayEmpty = type === 'Array' && keys.length === 0;
  return (isObjectEmpty || isArrayEmpty) && path.length;
};

function* traverse(objRoot, crawlProto = true, blacklist = bl) {
  const MAX_DEPTH = getMaxStackDepth();

  const stack = [objRoot];
  function* traverseInner(obj, path = []) {
    // Dont crawl too deep
    if (stack.length > MAX_DEPTH) {
      yield path;
      return;
    }

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
    const keys = getKeys(obj, crawlProto, blacklist);
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

const haveFoundEverything = (lut) => {
  const values = Object.values(lut);
  if (values.length === 0) return false;
  return _.every(values);
};

const updateLutGen = (leavesToFind) => {
  // In absense of whitelist. Yield all paths
  if (leavesToFind === null) return () => ({ shouldYield: true, done: false });

  const lut = leavesToFind.reduce((acc, next) => ({
    ...acc, [next]: false,
  }), {});

  return (path) => {
    const lastPath = _.last(path);
    const shouldYield = leavesToFind.indexOf(lastPath) !== -1;
    if (!shouldYield) return { shouldYield: false, done: false };
    lut[lastPath] = true;
    const done = haveFoundEverything(lut);
    return { shouldYield, done };
  };
};

function* traverseBfs(objRoot, leavesToFind = null, crawlProto = true, blacklist = bl) {
  // Early exit if empty
  if (leavesToFind && leavesToFind.length === 0) return;

  const MAX_DEPTH = getMaxStackDepth();

  const updateLut = updateLutGen(leavesToFind);
  const queue = [{ path: [], node: objRoot, stack: [] }];
  while (queue.length) {
    const { path, node, stack } = queue.shift();
    if (stack.length + 1 > MAX_DEPTH) {
      yield path;
      continue;
    }
    const type = inferTypeOfObject(node);
    if (type !== 'Object' && type !== 'Array') {
      if (path.length) {
        // Dont push empty paths
        const { shouldYield, done } = updateLut(path);
        if (shouldYield) yield path;
        if (done) return;
      }
      continue;
    }
    const getKeys = {
      Array: getKeysForArray,
      Object: getKeysForObject,
    }[type];
    const keys = getKeys(node, crawlProto, blacklist);
    if (isObjectLikeEmpty(type, keys, path)) {
      // Retain empty objects and arrays
      const { shouldYield, done } = updateLut(path);
      if (shouldYield) yield path;
      if (done) return;
    }
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      const child = node[key];
      const newStack = stack.concat([node]);
      // Only push non-cyclic children
      if (newStack.indexOf(child) === -1) {
        queue.push({
          path: path.concat([key]),
          node: child,
          stack: newStack,
        });
      }
    }
  }
}

module.exports = { traverse, traverseBfs, UTR_DEFAULT_STACK_DEPTH };

// https://stackoverflow.com/a/42658586/1217998
const getBlackListForProperty = type => Object
  .getOwnPropertyNames(type.prototype || Object)
  .filter(prop => !{ caller: true, callee: true, arguments: true }[prop])
  .filter((prop) => {
    try {
      return typeof type.prototype[prop] === 'function';
    } catch (e) {
      return true;
    }
  });

const getBlackList = () => {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects
  const types = [
    // Primitives
    Boolean, Number, String, /* BigInt, */ Symbol,
    // Object likes
    Object, Array, Map, Set, WeakMap, WeakSet, Date,
    // Arrays
    Int8Array, Uint8Array, Uint8ClampedArray, Int16Array,
    Uint16Array, Int32Array, Uint32Array, Float32Array,
    Float64Array, /* BigInt64Array, BigUint64Array, */
    // Function
    Function,
    // Global properties
    Error, RegExp, Math,
    // Global Structured data
    ArrayBuffer, SharedArrayBuffer, Atomics, DataView, JSON,
    // Control abstraction
    Promise, /* Generator, GeneratorFunction, AsyncFunction, Iterator, AsyncIterator, */
    // Reflection
    Reflect, Proxy,
    // Intl
    Intl,
    // WebAssembly
    /* WebAssembly, */
  ];
  const allProperties = types.reduce((acc, type) => {
    const keys = getBlackListForProperty(type);
    const obj = keys.reduce((innerAcc, key) => ({ ...innerAcc, [key]: true }), {});
    return { ...acc, ...obj };
  }, {});
  return allProperties;
};

module.exports = { getBlackList };

const fun = arr => arr.map(e => 2 * e);

const fun2 = num => num.toLocaleString();

const fun3 = f => f.call(null, 2);

module.exports = { fun, fun2, fun3 };

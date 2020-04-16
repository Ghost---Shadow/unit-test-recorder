const aux = require('./auxilary');

const fun = obj => obj.fun(1) + aux.fun(2);

module.exports = { fun };

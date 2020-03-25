const stringify = require('json-stringify-safe');

// https://stackoverflow.com/a/30204271/1217998
const safeStringify = obj => stringify(obj, null, 2, () => undefined);

module.exports = { safeStringify };

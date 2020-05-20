const clsHooked = require('cls-hooked');
const als = require('./async-hook-provider');

module.exports = {
  true: als,
  false: clsHooked,
}[process.env.UTR_EXPERIMENTAL_ALS || 'false'];

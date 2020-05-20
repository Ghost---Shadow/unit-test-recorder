const clsHooked = require('cls-hooked');

module.exports = {
  true: clsHooked,
  false: clsHooked,
}[process.env.UTR_EXPERIMENTAL_ALS || 'false'];

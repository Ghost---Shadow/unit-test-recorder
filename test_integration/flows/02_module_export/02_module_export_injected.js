var { recorderWrapper } = require("../../../src/recorder");const dum = a => 2 * a;

module.exports = (...p) => recorderWrapper("test_integration/flows/02_module_export/02_module_export.js", "dum", dum, "a", true, ...p);
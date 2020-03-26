const broadcastFunctions = (oldFn, newFn) => (...p) => {
  oldFn(...p);
  return newFn(...p);
};

module.exports = { broadcastFunctions };

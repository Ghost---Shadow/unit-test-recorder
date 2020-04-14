const aggregatorManager = {
  externalData: [],
};

const addExternalData = (externalData) => {
  aggregatorManager.concat(externalData);
};

module.exports = { aggregatorManager, addExternalData };

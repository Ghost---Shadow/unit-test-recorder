const aggregatorManager = {
  externalData: [],
};

const addExternalData = (externalData) => {
  aggregatorManager.externalData.concat(externalData);
};

module.exports = { aggregatorManager, addExternalData };

const newTarget = obj => new obj.InjectedPromise(resolve => resolve(42));

const sample = () => {};

module.exports = { newTarget, sample };

const _ = require('lodash');
const { getNamespace } = require('cls-hooked');

const recordToCls = (key, data) => {
  const session = getNamespace('default');
  if (!session.active) return;

  const stack = session.get('stack');
  const top = stack.length - 1;
  const injections = stack[top][key] || [];
  injections.push(data);
  stack[top][key] = injections;
  session.set('stack', stack);
};

const recordAllToRecorderState = (key, recorderFunction, captureIndex) => {
  const session = getNamespace('default');
  const stack = session.get('stack');
  const top = _.last(stack);
  const injections = top[key] || [];
  const meta = _.omit(top, ['injections', 'mocks']);

  injections.forEach((data) => {
    recorderFunction(captureIndex, meta, data);
  });
};

const promoteInjections = () => {
  // Parent needs all the injections recorded by child
  const session = getNamespace('default');
  const stack = session.get('stack');

  const childIndex = stack.length - 1;
  const parentIndex = stack.length - 2;
  if (parentIndex < 0) return;

  const promoteInner = (key) => {
    const childInjections = stack[childIndex][key] || [];
    const parentInjections = stack[parentIndex][key] || [];

    const newInjections = parentInjections.concat(childInjections);
    stack[parentIndex][key] = newInjections;
  };

  const DI_KEY = 'injections'; // TODO: Refactor out
  promoteInner(DI_KEY);

  // Child is recorded and no longer required
  stack.pop();

  session.set('stack', stack);
};

module.exports = {
  recordToCls,
  recordAllToRecorderState,
  promoteInjections,
};

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

const crossCorrelate = (pInjections, cInjections) => {
  const result = cInjections.map((cInjection) => {
    // Mocks dont have paramIndex
    if (cInjection.paramIndex === undefined) return cInjection;
    const probableInjections = pInjections
      .filter(pInjection => pInjection.funcUuid === cInjection.funcUuid);
    if (probableInjections.length > 1) console.warn('WARN: UUID duplication found', probableInjections);
    const pParamIndex = probableInjections
      .map(pInjection => pInjection.paramIndex)[0];
    if (pParamIndex === undefined) return null;
    return { ...cInjection, paramIndex: pParamIndex };
  });
  return result.filter(inj => inj);
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

    // Align the paramIndex from child to parent
    const crossCorrelatedChildren = crossCorrelate(parentInjections, childInjections);

    const newInjections = parentInjections.concat(crossCorrelatedChildren);
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
  crossCorrelate,
};

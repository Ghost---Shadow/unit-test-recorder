const _ = require('lodash');
const { getNamespace } = require('cls-hooked');

const {
  CLS_NAMESPACE,
  KEY_UUID,
  KEY_INJECTIONS,
  KEY_MOCKS,
} = require('../../util/constants');

const recordToCls = (key, data) => {
  const session = getNamespace(CLS_NAMESPACE);
  if (!session.active) return;

  const stack = session.get('stack');
  const top = stack.length - 1;
  const injections = stack[top][key] || [];
  injections.push(data);
  stack[top][key] = injections;
  session.set('stack', stack);
};

const recordAllToRecorderState = (key, recorderFunction, captureIndex) => {
  const session = getNamespace(CLS_NAMESPACE);
  const stack = session.get('stack');
  const top = _.last(stack);
  const injections = top[key] || [];
  const meta = _.omit(top, [KEY_INJECTIONS, KEY_MOCKS]);

  injections.forEach((data) => {
    recorderFunction(captureIndex, meta, data);
  });
};

const crossCorrelate = (pInjections, cInjections) => {
  const result = cInjections.map((cInjection) => {
    // Mocks dont have paramIndex
    if (cInjection.paramIndex === undefined) return cInjection;
    const probableInjections = pInjections
      .filter(pInjection => pInjection[KEY_UUID] === cInjection[KEY_UUID]);
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
  const session = getNamespace(CLS_NAMESPACE);
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

  promoteInner(KEY_INJECTIONS);
  // TODO: Promote mocks

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

const _ = require('lodash');
const { getNamespace } = require('../../util/cls-provider');

const {
  CLS_NAMESPACE,
  KEY_UUID,
  KEY_INJECTIONS,
  KEY_MOCKS,
  KEY_UUID_LUT,
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

const promoteInjections = () => {
  // Parent needs all the injections recorded by child
  const session = getNamespace(CLS_NAMESPACE);
  const stack = session.get('stack');
  const originalStackRef = session.get('originalStackRef');

  const selfRef = _.last(stack);
  const parentRef = _.last(originalStackRef);

  // If self is parent then do nothing
  if (selfRef === parentRef) return;

  // If there is no parent, then do nothing
  if (!parentRef) return;

  const promoteInner = (key, useLut) => {
    const childInjections = selfRef[key] || [];
    const parentInjections = parentRef[key] || [];
    const lut = parentRef[KEY_UUID_LUT] || {};

    // Align the paramIndex from child to parent
    const crossCorrelatedChildren = useLut ? childInjections
      .map(cInj => ({
        ...cInj,
        paramIndex: lut[cInj[KEY_UUID]],
      }))
      .filter(cInj => cInj.paramIndex !== undefined) : childInjections;

    const newInjections = parentInjections.concat(crossCorrelatedChildren);
    parentRef[key] = newInjections;
  };

  promoteInner(KEY_INJECTIONS, true);
  promoteInner(KEY_MOCKS, false);


  // Set the updated reference as stack
  session.set('stack', originalStackRef);
};

module.exports = {
  recordToCls,
  recordAllToRecorderState,
  promoteInjections,
};

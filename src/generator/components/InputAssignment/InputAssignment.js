const _ = require('lodash');

const { inferTypeOfObject } = require('../../../recorder/utils/dynamic-type-inference');
const { AssignmentOperation } = require('../AssignmentOperation/AssignmentOperation');

const primeObjectForInjections = (maybeObject, paramId, injections) => {
  if (inferTypeOfObject(injections) !== 'Object') return maybeObject;
  const dropProto = injArr => injArr.filter(elem => elem !== '__proto__');
  const allInjections = Object.keys(injections);
  const injArray = allInjections.map(inj => inj.split('.'));
  const injectionsOfCurrentParam = injArray.filter(injArr => injArr[0] === paramId);
  const droppedProto = injectionsOfCurrentParam.map(dropProto);
  const cleanedInjection = droppedProto.map(injArr => injArr.slice(1, injArr.length - 1));
  cleanedInjection.forEach((inj) => {
    _.set(maybeObject, inj, {});
  });
  return maybeObject;
};

const InputAssignment = (props) => {
  const {
    capture,
    meta,
    captureIndex,
    packagedArguments,
  } = props;
  const { paramIds } = meta;
  const { params, types } = capture;
  const paramTypes = _.get(types, 'params', []);

  const inputStatementData = paramIds
    .map((paramId, index) => {
      const maybeObject = params[index];
      const lIdentifier = paramId;
      const paramType = paramTypes[index];
      const maybePrimedObject = primeObjectForInjections(maybeObject, paramId, capture.injections);
      const code = AssignmentOperation(
        {
          meta,
          packagedArguments,
          maybeObject: maybePrimedObject,
          lIdentifier,
          captureIndex,
          paramType,
        },
      );
      return code;
    });
  const resultCode = AssignmentOperation(
    {
      meta,
      packagedArguments,
      maybeObject: capture.result,
      lIdentifier: 'result',
      captureIndex,
      paramType: _.get(capture, 'types.result'),
    },
  );
  return inputStatementData.concat(resultCode).join('\n');
};

module.exports = { InputAssignment };

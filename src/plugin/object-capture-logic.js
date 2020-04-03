const _ = require('lodash');
const t = require('@babel/types');
const { default: template } = require('@babel/template');
const { metaGenerator } = require('./meta');

const reassignmentTemplate = template(`
RHS_ME = LHS_ME
`);

const objectInjectorTemplate = template(`
LHS_ME = (...p) => recorderWrapper(META, RHS_ME, ...p);
`);

const memberExpressionFromFqn = (fqn) => {
  const fqnArr = fqn.split('.').map(part => t.identifier(part));
  return fqnArr.reduce((acc, next) => t.memberExpression(acc, next));
};

const generateMeAst = (fqn) => {
  const lhsAst = memberExpressionFromFqn(fqn);
  const rhsArr = fqn.split('.');
  const rhsFqn = [...rhsArr.slice(0, rhsArr.length - 1), `ORIGINAL_${rhsArr[rhsArr.length - 1]}`].join('.');
  const rhsAst = memberExpressionFromFqn(rhsFqn);
  return { lhsAst, rhsAst };
};

function instrumentValidObjects() {
  const capturedObjectNames = Object.keys(this.capturedObjects);
  // this.functionsToReplace has all exported identifiers, not just functions
  const exportedObjects = capturedObjectNames
    .filter(name => this.functionsToReplace[name].isExported);
  exportedObjects.forEach((objName) => {
    const { path, funObjs } = this.capturedObjects[objName];
    funObjs.forEach((funObj) => {
      const newFunObj = _.merge(
        funObj,
        this.functionsToReplace[objName],
        this.capturedObjects[objName],
      );
      const metaAst = metaGenerator(this.fileName, newFunObj);
      const { lhsAst, rhsAst } = generateMeAst(newFunObj.name);
      const reassignmentAst = reassignmentTemplate({ RHS_ME: rhsAst, LHS_ME: lhsAst });
      const objectInjectorAst = objectInjectorTemplate({
        RHS_ME: rhsAst,
        LHS_ME: lhsAst,
        META: metaAst,
      });
      path.insertAfter(objectInjectorAst);
      path.insertAfter(reassignmentAst);

      // Mark that wrapper must be imported
      this.atLeastOneRecorderWrapperUsed = true;
    });
  });
}

// Captures the fully qualified name for all function likes
// within objects
const traverseProperties = (objName, objectProperties) => {
  const result = [];
  objectProperties.forEach((property) => {
    const name = `${objName}.${property.key.name}`;
    if (t.isArrowFunctionExpression(property.value)) {
      const paramIds = property.value.params.map(p => p.name);
      const isAsync = !!property.value.async;
      result.push({
        name,
        paramIds,
        injectionWhitelist: ['TODO'], // TODO
        isAsync,
      });
    }
    if (t.isObjectMethod(property)) {
      const paramIds = property.params.map(p => p.name);
      const isAsync = !!property.async;
      result.push({
        name,
        paramIds,
        injectionWhitelist: ['TODO'], // TODO
        isAsync,
      });
    }
    if (t.isObjectExpression(property.value)) {
      const subObjName = `${objName}.${property.key.name}`;
      const { properties } = property.value;
      const subResult = traverseProperties(subObjName, properties);
      result.push(...subResult);
    }
  });
  return result;
};

// Capture object from object expression
function captureObjFromOe(path) {
  const leftName = _.get(path, 'parent.left.name');
  const idName = _.get(path, 'parent.id.name');
  const properties = _.get(path, 'node.properties', []);
  const objectName = leftName || idName;
  if (!objectName) return;
  const funObjs = traverseProperties(objectName, properties);
  if (funObjs.length) {
    const grandParentPath = _.get(path, 'parentPath.parentPath');
    this.capturedObjects[objectName] = {
      path: grandParentPath,
      funObjs,
      isObject: true,
    };
  }
}

module.exports = { captureObjFromOe, instrumentValidObjects, memberExpressionFromFqn };

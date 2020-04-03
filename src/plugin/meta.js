const t = require('@babel/types');

const metaGenerator = (path, funObj) => {
  const {
    name, isAsync, paramIds, isDefault, isEcmaDefault, injectionWhitelist, isObject,
  } = funObj;
  return t.objectExpression([
    t.objectProperty(t.identifier('path'), t.stringLiteral(path)),
    t.objectProperty(t.identifier('name'), t.stringLiteral(name)),
    // t.objectProperty(t.identifier('localName'), t.stringLiteral(localName)),
    t.objectProperty(t.identifier('paramIds'), t.arrayExpression(paramIds.map(pid => t.stringLiteral(pid)))),
    t.objectProperty(t.identifier('injectionWhitelist'), t.arrayExpression(injectionWhitelist.map(wl => t.stringLiteral(wl)))),
    t.objectProperty(t.identifier('isDefault'), t.booleanLiteral(isDefault)),
    t.objectProperty(t.identifier('isEcmaDefault'), t.booleanLiteral(isEcmaDefault)),
    t.objectProperty(t.identifier('isAsync'), t.booleanLiteral(isAsync)),
    t.objectProperty(t.identifier('isObject'), t.booleanLiteral(isObject)),
  ]);
};

module.exports = { metaGenerator };

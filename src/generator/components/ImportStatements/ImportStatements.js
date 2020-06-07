const _ = require('lodash');

const {
  AggregatorManager,
} = require('../../external-data-aggregator');

const DefaultImportStatement = (props) => {
  const { importPath, identifier, packagedArguments } = props;
  const { isTypescript } = packagedArguments;
  if (isTypescript) {
    return `import * as ${identifier} from '${importPath}'`;
  }
  return `const ${identifier} = require('${importPath}');`;
};

const EcmaDefaultImportStatement = (props) => {
  const { importPath, identifier, packagedArguments } = props;
  const { isTypescript } = packagedArguments;
  if (isTypescript) {
    return `import ${identifier} from '${importPath}'`;
  }
  return `const {default:${identifier}} = require('${importPath}');`;
};

const DestructureImportStatement = (props) => {
  const { importPath, identifier, packagedArguments } = props;
  const { isTypescript } = packagedArguments;
  if (isTypescript) {
    return `import {${identifier}} from '${importPath}'`;
  }
  return `const {${identifier}} = require('${importPath}');`;
};

const FunctionImportStatements = ({ exportedFunctions, packagedArguments }) => {
  const importedFunctions = Object.keys(exportedFunctions);
  // Functions in objects have names like obj.fun1, obj.fun2
  const cleanImportedFunctions = _.uniqBy(
    importedFunctions.map(name => ({
      identifier: name.split('.')[0],
      meta: exportedFunctions[name].meta,
    })),
    'identifier',
  );
  const importStatements = cleanImportedFunctions.map(({ identifier, meta }) => {
    const { isDefault, isEcmaDefault, importPath } = meta;
    const props = { identifier, importPath, packagedArguments };
    if (isEcmaDefault) return EcmaDefaultImportStatement(props);
    if (isDefault) return DefaultImportStatement(props);
    return DestructureImportStatement(props);
  });

  return importStatements.join('\n');
};

const ExternalDataImportStatements = (props) => {
  const { path, packagedArguments } = props;
  const { isTypescript } = packagedArguments;
  const externalData = AggregatorManager.getExternalData(path);
  const externalsWithoutMocks = externalData.filter(ed => !ed.isMock);
  const ImportStatement = isTypescript ? EcmaDefaultImportStatement : DefaultImportStatement;
  const statements = externalsWithoutMocks
    .map(data => ({ ...data, packagedArguments }))
    .map(ImportStatement);
  return statements.join('\n');
};

const ImportStatements = (props) => {
  const { exportedFunctions, path, packagedArguments } = props;

  const functionImportStatements = FunctionImportStatements({
    exportedFunctions,
    packagedArguments,
  });
  const externalImportStatements = ExternalDataImportStatements({
    path,
    packagedArguments,
  });

  return `${functionImportStatements}\n\n${externalImportStatements}\n`;
};

module.exports = {
  DefaultImportStatement,
  EcmaDefaultImportStatement,
  DestructureImportStatement,

  FunctionImportStatements,
  ExternalDataImportStatements,

  ImportStatements,
};

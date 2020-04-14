const _ = require('lodash');

const {
  AggregatorManager,
} = require('../../external-data-aggregator');

const DefaultImportStatement = (props) => {
  const { importPath, identifier } = props;
  return `const ${identifier} = require('${importPath}');`;
};

const EcmaDefaultImportStatement = (props) => {
  const { importPath, identifier } = props;
  return `const {default:${identifier}} = require('${importPath}');`;
};

const DestructureImportStatement = (props) => {
  const { importPath, identifier } = props;
  return `const {${identifier}} = require('${importPath}');`;
};

const FunctionImportStatements = ({ activity }) => {
  const importedFunctions = Object.keys(activity);
  // Functions in objects have names like obj.fun1, obj.fun2
  const cleanImportedFunctions = _.uniqBy(
    importedFunctions.map(name => ({
      identifier: name.split('.')[0],
      meta: activity[name].meta,
    })),
    'identifier',
  );
  const importStatements = cleanImportedFunctions.map(({ identifier, meta }) => {
    const { isDefault, isEcmaDefault, importPath } = meta;
    if (isEcmaDefault) return EcmaDefaultImportStatement({ identifier, importPath });
    if (isDefault) return DefaultImportStatement({ identifier, importPath });
    return DestructureImportStatement({ identifier, importPath });
  });

  return importStatements.join('\n');
};

const ExternalDataImportStatements = (props) => {
  const { path } = props;
  const externalData = AggregatorManager.getExternalData(path);
  const externalsWithoutMocks = externalData.filter(ed => !ed.isMock);
  const statements = externalsWithoutMocks.map(DefaultImportStatement);
  return statements.join('\n');
};

const ImportStatements = (props) => {
  const { activity, path } = props;

  const functionImportStatements = FunctionImportStatements({ activity });
  const externalImportStatements = ExternalDataImportStatements({ path });

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

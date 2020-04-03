const {
  mockInjectedFunctions,
  capturePathsOfRequiredModules,
  captureUsageOfImportedFunction,
} = require('./mocks-logic');

const {
  getValidFunctions,
  maybeAddImportStatement,
  injectValidFunctions,
} = require('./wrapper-logic');

const {
  captureEfFromMe,
  captureEfFromEd,
  captureEfFromEn,
  captureEfFromEp,
  captureFunFromFd,
  captureFunFromAf,
  captureFunForDi,
} = require('./capture-logic');

const {
  getValidInjections,
  unclobberInjections,
  addInjectedFunctionsToMeta,
} = require('./dependency-injection');

const {
  captureObjFromOe,
  instrumentValidObjects,
} = require('./object-capture-logic');

const { getBlackList } = require('./blacklist-generator');

module.exports = (/* { types: t } */) => ({
  name: 'unit-test-recorder',
  visitor: {
    Program: {
      enter(path) {
        // Expected initial state
        // Filename of the file being traversed
        if (!this.fileName) throw new Error('fileName should be passed in state');
        // Absolute path to recorder.js
        if (!this.importPath) throw new Error('importPath should be passed in state');
        // Modules that should be mocked
        if (!this.whiteListedModules) throw new Error('whiteListedModules should be passed in state');

        // Function bindings for mock-logic
        this.mockInjectedFunctions = mockInjectedFunctions.bind(this);
        this.capturePathsOfRequiredModules = capturePathsOfRequiredModules.bind(this);
        this.captureUsageOfImportedFunction = captureUsageOfImportedFunction.bind(this);

        // Function bindings for wrapper-logic
        this.getValidFunctions = getValidFunctions.bind(this);
        this.maybeAddImportStatement = maybeAddImportStatement.bind(this);
        this.injectValidFunctions = injectValidFunctions.bind(this);

        // Function bindings for capture-logic
        this.captureEfFromMe = captureEfFromMe.bind(this);
        this.captureEfFromEd = captureEfFromEd.bind(this);
        this.captureEfFromEn = captureEfFromEn.bind(this);
        this.captureEfFromEp = captureEfFromEp.bind(this);
        this.captureFunFromFd = captureFunFromFd.bind(this);
        this.captureFunFromAf = captureFunFromAf.bind(this);
        this.captureFunForDi = captureFunForDi.bind(this);

        // Function bindings for dependency-injection
        this.getValidInjections = getValidInjections.bind(this);
        this.unclobberInjections = unclobberInjections.bind(this);
        this.addInjectedFunctionsToMeta = addInjectedFunctionsToMeta.bind(this);

        // Function bindings for object capture logic
        this.captureObjFromOe = captureObjFromOe.bind(this);
        this.instrumentValidObjects = instrumentValidObjects.bind(this);

        // States
        // Imported modules which are candidates for mocking
        this.importedModules = {};
        // Metadata for identifiers that are maybe functions and exported
        this.functionsToReplace = {};
        // Metadata for objects that have functions in them
        this.capturedObjects = {};
        // Metadata for functions that are exported
        this.validFunctions = [];
        // All functions called by dependency injected objects
        this.injectedFunctions = {};
        // Dont inject these functions
        this.injectionBlackList = getBlackList();
        // All variables bound to program level scope
        this.topLevelBindings = path.scope.bindings;
      },
      exit(path) {
        // The identifier has to be a function and exported
        this.validFunctions = this.getValidFunctions();

        // Only these dependency injections are captureable
        this.validDependencyInjections = this.getValidInjections();

        // Rename all the dependency injected functions
        this.unclobberInjections();
        // Add these functions to meta so that recorder can pick it up
        this.addInjectedFunctionsToMeta();

        // Instrument functions which match criteria
        this.injectValidFunctions();

        // Instrument exported objects
        this.instrumentValidObjects();

        // Instrument mocks of whitelisted modules
        this.mockInjectedFunctions();

        // Dont add import statement if there are no exported functions
        // Dont import mocks if nothing is mocked
        this.maybeAddImportStatement(path);
      },
    },
    ArrowFunctionExpression(path) {
      // Capture function from arrow function expression
      this.captureFunFromAf(path);
    },
    FunctionDeclaration(path) {
      // Capture function from function declaration
      this.captureFunFromFd(path);
    },
    ExportNamedDeclaration(path) {
      // Capture exported identifier from export named declaration
      this.captureEfFromEn(path);
    },
    ExportDefaultDeclaration(path) {
      // Capture exported identifier from export default
      this.captureEfFromEd(path);
    },
    AssignmentExpression(path) {
      // Capture exported identifier from module exports
      this.captureEfFromMe(path);

      // Capture exported identifier from exported property
      this.captureEfFromEp(path);
    },
    CallExpression(path) {
      // Capture all functions that are candidates for mocking
      this.capturePathsOfRequiredModules(path);
      this.captureUsageOfImportedFunction(path);

      // Capture called functions for dependency injections
      this.captureFunForDi(path);
    },
    NewExpression(path) {
      // Capture called functions for dependency injections
      this.captureFunForDi(path);
    },
    ObjectExpression(path) {
      // Capture functions in object from object expression
      this.captureObjFromOe(path);
    },
  },
});

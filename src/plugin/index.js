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
  captureFunFromFd,
  captureFunFromAf,
  captureFunForDi,
} = require('./capture-logic');

const {
  unclobberInjections,
  addInjectedFunctionsToMeta,
} = require('./dependency-injection');

module.exports = (/* { types: t } */) => ({
  name: 'unit-test-recorder',
  visitor: {
    Program: {
      enter() {
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
        this.captureFunFromFd = captureFunFromFd.bind(this);
        this.captureFunFromAf = captureFunFromAf.bind(this);
        this.captureFunForDi = captureFunForDi.bind(this);

        // Function bindings for dependency-injection
        this.unclobberInjections = unclobberInjections.bind(this);
        this.addInjectedFunctionsToMeta = addInjectedFunctionsToMeta.bind(this);

        // States
        // Imported modules which are candidates for mocking
        this.importedModules = {};
        // Metadata for identifiers that are maybe functions and exported
        this.functionsToReplace = {};
        // Metadata for functions that are exported
        this.validFunctions = [];
        // All functions called by dependency injected objects
        this.injectedFunctions = [];
      },
      exit(path) {
        // The identifier has to be a function and exported
        this.validFunctions = this.getValidFunctions();

        // Rename all the dependency injected functions
        this.unclobberInjections();
        // Add these functions to meta so that recorder can pick it up
        this.addInjectedFunctionsToMeta();

        // Instrument functions which match criteria
        this.injectValidFunctions();

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
    },
    CallExpression(path) {
      // Capture all functions that are candidates for mocking
      this.capturePathsOfRequiredModules(path);
      this.captureUsageOfImportedFunction(path);

      // Capture called functions for dependency injections
      this.captureFunForDi(path);
    },
  },
});

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
} = require('./capture-logic');

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

        // States
        // Imported modules which are candidates for mocking
        this.importedModules = {};
        // Metadata for identifiers that are maybe functions and exported
        this.functionsToReplace = {};
        // Metadata for functions that are exported
        this.validFunctions = [];
      },
      exit(path) {
        // The identifier has to be a function and exported
        this.validFunctions = this.getValidFunctions();

        // Dont add import statement if there are no exported functions
        this.maybeAddImportStatement(path);

        // Instrument functions which match criteria
        this.injectValidFunctions();

        // Instrument mocks of whitelisted modules
        this.mockInjectedFunctions();
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
    },
  },
});

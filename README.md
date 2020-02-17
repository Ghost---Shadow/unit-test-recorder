# unit-test-recorder

Record unit tests as you use your application

## Installation

```sh
npm i -g unit-test-recorder
```

## Usage

1. Make sure you are using git and there are no uncommited changes.
2. Run `unit-test-recorder <your entrypoint>.js`. Usually it is `index.js`. If you are using React then it should detect it automatically. If it doesnt you can pass `--react` flag. For node it is `--node`.
3. It will now crawl through your project and hook itself into all your files. It will use `git reset` to revert it when testing is done.
4. As you use your application, it will record unit tests for all your exported functions. Look at the [strategy](#strategy) section for more information.
5. Press `S` key on the keyboard to safely stop the recording and your application.
6. Run your favourite linter/prettier to clean up the generated test code.

## Strategy

### Number of test cases per function

It will record five test cases for each type of function argument. You can control this using `--tests=10` flag.

## Planned features

1. Branch and coverage detection
2. Recording passed functions as arguments

## Similar software

1. [UIRecorder](https://uirecorder.com/) - Similar idea but for java
2. [redux-test-recorder](https://github.com/conorhastings/redux-test-recorder) - Redux middleware which records the states and actions
3. [test-recorder](https://github.com/QuantumInformation/test-recorder) - Frontend only

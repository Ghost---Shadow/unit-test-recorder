jest.mock('uuid', () => {
  let counter = 0;
  counter += 1;
  const uuidGen = () => `uuid_${counter}`;
  uuidGen.reset = () => {
    counter = 0;
  };
  return { v4: uuidGen };
});

const _ = require('lodash');
const uuid = require('uuid');

const { getNamespace } = require('../../util/cls-provider');

const {
  CLS_NAMESPACE,
  KEY_UUID_LUT,
  KEY_UUID,
} = require('../../util/constants');
const RecorderManager = require('../manager');

const {
  recorderWrapper: boundRecorderWrapper,
  unBoundRecorderWrapper: recorderWrapper,
} = require('./wrapper');

const { mockRecorderWrapper } = require('../mock/wrapper');

describe('user-function-wrapper', () => {
  describe('recorderWrapper', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      RecorderManager.clear();
      uuid.v4.reset();
    });
    it('should set meta and inject sync functions', () => {
      const session = getNamespace(CLS_NAMESPACE);
      session.run(() => {
        const injFn = jest.fn().mockImplementation((a, b) => a + b);
        const meta = {
          path: 'dir1/file1.js',
          name: 'fun1',
          paramIds: ['fn', 'a', 'b'],
        };
        const innerFunction = jest.fn().mockImplementation((fn, a, b) => {
          fn(a, b);
          fn(a + 1, b + 1);
          return a + b;
        });
        const params = [injFn, 1, 2];
        const result = recorderWrapper(meta, innerFunction, ...params);
        expect(result).toBe(3);
        expect(innerFunction.mock.calls.length).toEqual(1);
        const stack = session.get('stack');
        expect(stack.length).toBe(1);
        const data1 = {
          paramIndex: 0,
          fppkey: null,
          params: [],
          result: 3,
          [KEY_UUID]: 'uuid_0',
        };
        const data2 = {
          paramIndex: 0,
          fppkey: null,
          params: [],
          result: 5,
          [KEY_UUID]: 'uuid_0',
        };
        expect(stack[0].injections).toEqual([data1, data2]);
        expect(RecorderManager.recorderState).toMatchInlineSnapshot(`
          Object {
            "dir1/file1.js": Object {
              "exportedFunctions": Object {
                "fun1": Object {
                  "captures": Array [
                    Object {
                      "injections": Object {
                        "fn": Object {
                          "captures": Array [
                            Object {
                              "params": Array [],
                              "result": 3,
                              "types": Object {
                                "params": Array [],
                                "result": "Number",
                              },
                            },
                            Object {
                              "params": Array [],
                              "result": 5,
                              "types": Object {
                                "params": Array [],
                                "result": "Number",
                              },
                            },
                          ],
                        },
                      },
                      "params": Array [
                        "function () {
                  return fn.apply(this, arguments);
                }",
                        1,
                        2,
                      ],
                      "result": 3,
                      "types": Object {
                        "params": Array [
                          "Function",
                          "Number",
                          "Number",
                        ],
                        "result": "Number",
                      },
                    },
                  ],
                  "hashTable": Object {
                    "sp71Isul6+y7NgjD7SvYQg==": true,
                  },
                  "meta": Object {
                    "doesReturnPromise": false,
                    "name": "fun1",
                    "paramIds": Array [
                      "fn",
                      "a",
                      "b",
                    ],
                    "path": "dir1/file1.js",
                  },
                },
              },
            },
          }
        `);
      });
    });
    it('should set meta and inject async functions', (done) => {
      const session = getNamespace(CLS_NAMESPACE);
      session.run(async () => {
        const injFn = jest.fn().mockImplementation(async (a, b) => a + b);
        const meta = {
          path: 'dir1/file1.js',
          name: 'fun1',
          paramIds: ['fn', 'a', 'b'],
        };
        const innerFunction = jest.fn().mockImplementation(async (fn, a, b) => {
          await fn(a, b);
          await fn(a + 1, b + 1);
          return a + b;
        });
        const params = [injFn, 1, 2];
        const result = await recorderWrapper(meta, innerFunction, ...params);
        expect(result).toBe(3);
        expect(innerFunction.mock.calls.length).toEqual(1);
        const stack = session.get('stack');
        expect(stack.length).toBe(1);
        const data1 = {
          paramIndex: 0,
          fppkey: null,
          params: [],
          result: 3,
          [KEY_UUID]: 'uuid_0',
        };
        const data2 = {
          paramIndex: 0,
          fppkey: null,
          params: [],
          result: 5,
          [KEY_UUID]: 'uuid_0',
        };
        expect(stack[0].injections).toEqual([data1, data2]);
        expect(RecorderManager.recorderState).toMatchInlineSnapshot(`
          Object {
            "dir1/file1.js": Object {
              "exportedFunctions": Object {
                "fun1": Object {
                  "captures": Array [
                    Object {
                      "injections": Object {
                        "fn": Object {
                          "captures": Array [
                            Object {
                              "params": Array [],
                              "result": 3,
                              "types": Object {
                                "params": Array [],
                                "result": "Number",
                              },
                            },
                            Object {
                              "params": Array [],
                              "result": 5,
                              "types": Object {
                                "params": Array [],
                                "result": "Number",
                              },
                            },
                          ],
                        },
                      },
                      "params": Array [
                        "function () {
                  return fn.apply(this, arguments);
                }",
                        1,
                        2,
                      ],
                      "result": 3,
                      "types": Object {
                        "params": Array [
                          "Function",
                          "Number",
                          "Number",
                        ],
                        "result": "Number",
                      },
                    },
                  ],
                  "hashTable": Object {
                    "sp71Isul6+y7NgjD7SvYQg==": true,
                  },
                  "meta": Object {
                    "doesReturnPromise": true,
                    "name": "fun1",
                    "paramIds": Array [
                      "fn",
                      "a",
                      "b",
                    ],
                    "path": "dir1/file1.js",
                  },
                },
              },
            },
          }
        `);
        done();
      });
    });
    it('should broadcast injected activity to calling function in same file', () => {
      const session = getNamespace(CLS_NAMESPACE);
      session.run(() => {
        const childFunctionMeta = {
          path: 'dir1/file1.js',
          name: 'child',
          paramIds: ['a', 'fn'],
        };
        const childFn = jest.fn().mockImplementation((a, fn) => {
          const result = a + fn(2);
          const stack = session.get('stack');
          expect(stack[1]).toEqual({
            injections: [
              {
                fppkey: null,
                [KEY_UUID]: 'uuid_0',
                paramIndex: 1,
                params: [],
                result: 2,
              },
            ],
            name: 'child',
            paramIds: ['a', 'fn'],
            path: 'dir1/file1.js',
            [KEY_UUID_LUT]: { uuid_0: 1 },
          });
          return result;
        });
        const parentMeta = {
          path: 'dir1/file1.js',
          name: 'parent',
          paramIds: ['fn'],
        };
        const boundChild = (...params) => recorderWrapper(childFunctionMeta, childFn, ...params);
        const parentFn = jest.fn().mockImplementation((fn) => {
          const a = fn(1);
          const b = boundChild(a, fn);
          const c = fn(3);
          return a + b + c;
        });
        const injFn = jest.fn().mockImplementation(a => a);
        const params = [injFn];
        const result = recorderWrapper(parentMeta, parentFn, ...params);
        expect(result).toBe(7);
        expect(injFn.mock.calls.length).toEqual(3);
        const stack = session.get('stack');
        expect(stack.length).toBe(1);
        const parentInjections = stack[0].injections;
        const data1 = {
          paramIndex: 0,
          fppkey: null,
          params: [],
          result: 1,
          [KEY_UUID]: 'uuid_0',
        };
        const data2 = {
          paramIndex: 0,
          fppkey: null,
          params: [],
          result: 2,
          [KEY_UUID]: 'uuid_0',
        };
        const data3 = {
          paramIndex: 0,
          fppkey: null,
          params: [],
          result: 3,
          [KEY_UUID]: 'uuid_0',
        };
        expect(parentInjections).toEqual([
          data1,
          data2, // child
          data3,
        ]);
        const parentAddress = [
          'dir1/file1.js',
          'exportedFunctions',
          'parent',
          'captures',
          0,
          'injections',
        ];
        expect(_.get(RecorderManager.recorderState, parentAddress))
          .toMatchInlineSnapshot(`
          Object {
            "fn": Object {
              "captures": Array [
                Object {
                  "params": Array [],
                  "result": 1,
                  "types": Object {
                    "params": Array [],
                    "result": "Number",
                  },
                },
                Object {
                  "params": Array [],
                  "result": 2,
                  "types": Object {
                    "params": Array [],
                    "result": "Number",
                  },
                },
                Object {
                  "params": Array [],
                  "result": 3,
                  "types": Object {
                    "params": Array [],
                    "result": "Number",
                  },
                },
              ],
            },
          }
        `);
        const childAddress = [
          'dir1/file1.js',
          'exportedFunctions',
          'child',
          'captures',
          0,
          'injections',
        ];
        expect(_.get(RecorderManager.recorderState, childAddress))
          .toMatchInlineSnapshot(`
          Object {
            "fn": Object {
              "captures": Array [
                Object {
                  "params": Array [],
                  "result": 2,
                  "types": Object {
                    "params": Array [],
                    "result": "Number",
                  },
                },
              ],
            },
          }
        `);
      });
    });
    it('should work for mock functions', () => {
      const session = getNamespace(CLS_NAMESPACE);
      session.run(() => {
        const mockFn = jest.fn().mockImplementation((a, b) => a + b);
        const mockMeta = {
          path: 'dir1/file1.js',
          moduleName: 'fs',
          name: 'readFileSync',
        };
        const wrappedMock = (...p) => mockRecorderWrapper(mockMeta, mockFn, ...p);
        const meta = {
          path: 'dir1/file1.js',
          name: 'fun1',
          paramIds: ['a', 'b'],
        };
        const innerFunction = jest.fn().mockImplementation((a, b) => {
          const c = wrappedMock(a, b);
          const d = wrappedMock(a + 1, b + 1);
          return c + d;
        });
        const params = [1, 2];
        const result = recorderWrapper(meta, innerFunction, ...params);
        expect(result).toBe(8);
        expect(innerFunction.mock.calls.length).toEqual(1);
        const stack = session.get('stack');
        expect(stack.length).toBe(1);
        const data1 = {
          mockMeta,
          params: [],
          result: 3,
        };
        const data2 = {
          mockMeta,
          params: [],
          result: 5,
        };
        expect(stack[0].mocks).toEqual([data1, data2]);
        expect(
          RecorderManager.recorderState['dir1/file1.js'].exportedFunctions.fun1
            .captures[0].mocks,
        ).toMatchInlineSnapshot(`
          Object {
            "fs": Object {
              "readFileSync": Object {
                "captures": Array [
                  Object {
                    "params": Array [],
                    "result": 3,
                    "types": Object {
                      "params": Array [],
                      "result": "Number",
                    },
                  },
                  Object {
                    "params": Array [],
                    "result": 5,
                    "types": Object {
                      "params": Array [],
                      "result": "Number",
                    },
                  },
                ],
              },
            },
          }
        `);
      });
    });
  });
  describe('boundRecorderWrapper', () => {
    it('should create a new context for each call', () => {
      const session = getNamespace(CLS_NAMESPACE);
      const fn = () => {
        const stack = session.get('stack');
        expect(stack.length).toBe(1);
      };
      const meta = { name: 'fn' };
      const wrappedFn = (...params) => boundRecorderWrapper(meta, fn, ...params);
      wrappedFn();
      wrappedFn();
    });
    it('should not create a new context for nested calls', () => {
      const session = getNamespace(CLS_NAMESPACE);
      const childFn = () => {
        const stack = session.get('stack');
        expect(stack).toEqual([{ name: 'parentFn' }, { name: 'childFn' }]);
      };
      const wrappedChild = (...params) => boundRecorderWrapper({ name: 'childFn' }, childFn, ...params);
      const parentFn = () => {
        wrappedChild();
        const stack = session.get('stack');
        expect(stack).toEqual([{ name: 'parentFn', injections: [], mocks: [] }]);
      };
      const wrappedParent = (...params) => boundRecorderWrapper({ name: 'parentFn' }, parentFn, ...params);
      wrappedParent();
    });
  });
});

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
          expect(stack[0]).toEqual({
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
    beforeEach(() => {
      jest.resetAllMocks();
      RecorderManager.clear();
      uuid.v4.reset();
    });
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
        const originalStackRef = session.get('originalStackRef');
        expect(originalStackRef).toEqual([{ name: 'parentFn' }]);
        expect(stack).toEqual([{ name: 'childFn' }]);
      };
      const wrappedChild = (...params) => boundRecorderWrapper({ name: 'childFn' }, childFn, ...params);
      const parentFn = () => {
        wrappedChild();
        const stack = session.get('stack');
        expect(stack).toEqual([
          { name: 'parentFn', injections: [], mocks: [] },
        ]);
      };
      const wrappedParent = (...params) => boundRecorderWrapper({ name: 'parentFn' }, parentFn, ...params);
      wrappedParent();
    });
    describe('race conditions', () => {
      it('should work when there are no race conditions', async () => {
        const callStack = [];
        const session = getNamespace(CLS_NAMESPACE);
        const childStacks = {};
        const originalStackRefs = {};
        let parentFnStack = null;
        const child1Meta = { name: 'childFn1', paramIds: ['fn'], path: 'c1Path' };
        const child2Meta = { name: 'childFn2', paramIds: ['fn'], path: 'c2Path' };
        const parentMeta = { name: 'parentFn', paramIds: ['fn'], path: 'parentPath' };
        const childInj1 = {
          UTR_UUID: 'uuid_0',
          fppkey: null,
          paramIndex: 0,
          params: [],
          result: 'childFn1',
        };
        const childInj2 = {
          UTR_UUID: 'uuid_0',
          fppkey: null,
          paramIndex: 0,
          params: [],
          result: 'childFn2',
        };
        const parentInj = {
          UTR_UUID: 'uuid_0',
          fppkey: null,
          paramIndex: 0,
          params: [],
          result: 'parentFn',
        };
        const sampleInj = a => a;
        const childFn = (fn, delay, name) => {
          callStack.push(`${name} - enter`);
          return new Promise(resolve => setTimeout(() => {
            fn(name);
            const stack = session.get('stack');
            const originalStackRef = session.get('originalStackRef');
            childStacks[name] = _.cloneDeep(stack);
            originalStackRefs[name] = _.cloneDeep(originalStackRef);
            callStack.push(`${name} - exit`);
            resolve();
          }, delay));
        };
        const wrappedChild1 = () => boundRecorderWrapper(child1Meta, childFn, sampleInj, 1, 'childFn1');
        const wrappedChild2 = () => boundRecorderWrapper(child2Meta, childFn, sampleInj, 1, 'childFn2');
        const parentFn = async (fn) => {
          const stack = session.get('stack');
          // const originalStackRef = session.get('originalStackRef');
          callStack.push('parentFn enter');
          fn('parentFn');
          await wrappedChild1();
          await wrappedChild2();
          parentFnStack = _.cloneDeep(stack);
        };
        const wrappedParent = () => boundRecorderWrapper(parentMeta, parentFn, sampleInj);
        await wrappedParent();
        // Sanity check
        expect(callStack).toEqual([
          'parentFn enter',
          'childFn1 - enter',
          'childFn1 - exit',
          'childFn2 - enter',
          'childFn2 - exit',
        ]);
        expect(originalStackRefs.childFn1).toEqual([
          {
            doesReturnPromise: true,
            injections: [parentInj],
            name: 'parentFn',
            paramIds: ['fn'],
            path: 'parentPath',
            uuidLut: { uuid_0: 0 },
          },
        ]);
        expect(childStacks.childFn1).toEqual(
          [
            {
              doesReturnPromise: true,
              injections: [childInj1],
              name: 'childFn1',
              paramIds: ['fn'],
              path: 'c1Path',
              uuidLut: { uuid_0: 0 },
            },
          ],
        );
        expect(originalStackRefs.childFn2).toEqual([
          {
            doesReturnPromise: true,
            injections: [parentInj, childInj1],
            mocks: [],
            name: 'parentFn',
            paramIds: ['fn'],
            path: 'parentPath',
            uuidLut: { uuid_0: 0 },
          },
        ]);
        expect(childStacks.childFn2).toEqual(
          [
            {
              doesReturnPromise: true,
              injections: [childInj2],
              name: 'childFn2',
              paramIds: ['fn'],
              path: 'c2Path',
              uuidLut: { uuid_0: 0 },
            },
          ],
        );
        expect(parentFnStack).toEqual(
          [
            {
              doesReturnPromise: true,
              injections: [parentInj, childInj1, childInj2],
              mocks: [],
              name: 'parentFn',
              paramIds: ['fn'],
              path: 'parentPath',
              uuidLut: { uuid_0: 0 },
            },
          ],
        );
      });
      it('should work when in 1 in 2 out 2 out 1', async () => {
        const callStack = [];
        const session = getNamespace(CLS_NAMESPACE);
        const originalStackRefs = {};
        const childStacks = {};
        let parentFnStack = null;
        const child1Meta = { name: 'childFn1', paramIds: ['fn'], path: 'c1Path' };
        const child2Meta = { name: 'childFn2', paramIds: ['fn'], path: 'c2Path' };
        const parentMeta = { name: 'parentFn', paramIds: ['fn'], path: 'parentPath' };
        const childInj1 = {
          UTR_UUID: 'uuid_0',
          fppkey: null,
          paramIndex: 0,
          params: [],
          result: 'childFn1',
        };
        const childInj2 = {
          UTR_UUID: 'uuid_0',
          fppkey: null,
          paramIndex: 0,
          params: [],
          result: 'childFn2',
        };
        const parentInj = {
          UTR_UUID: 'uuid_0',
          fppkey: null,
          paramIndex: 0,
          params: [],
          result: 'parentFn',
        };
        const sampleInj = a => a;
        const childFn = (fn, delay, name) => {
          callStack.push(`${name} - enter`);
          return new Promise(resolve => setTimeout(() => {
            fn(name);
            const stack = session.get('stack');
            const originalStackRef = session.get('originalStackRef');
            childStacks[name] = _.cloneDeep(stack);
            originalStackRefs[name] = _.cloneDeep(originalStackRef);
            callStack.push(`${name} - exit`);
            resolve();
          }, delay));
        };
        const wrappedChild1 = () => boundRecorderWrapper(child1Meta, childFn, sampleInj, 10, 'childFn1');
        const wrappedChild2 = () => boundRecorderWrapper(child2Meta, childFn, sampleInj, 1, 'childFn2');
        const parentFn = async (fn) => {
          const stack = session.get('stack');
          callStack.push('parentFn enter');
          fn('parentFn');
          const p1 = wrappedChild1();
          const p2 = wrappedChild2();
          await Promise.all([p1, p2]);
          parentFnStack = _.cloneDeep(stack);
        };
        const wrappedParent = () => boundRecorderWrapper(parentMeta, parentFn, sampleInj);
        await wrappedParent();
        // Sanity check
        expect(callStack).toEqual([
          'parentFn enter',
          'childFn1 - enter',
          'childFn2 - enter',
          'childFn2 - exit',
          'childFn1 - exit',
        ]);
        expect(originalStackRefs.childFn1).toEqual([
          {
            doesReturnPromise: true,
            injections: [parentInj, childInj2],
            mocks: [],
            name: 'parentFn',
            paramIds: ['fn'],
            path: 'parentPath',
            uuidLut: { uuid_0: 0 },
          },
        ]);
        expect(childStacks.childFn1).toEqual(
          [
            {
              doesReturnPromise: true,
              injections: [childInj1],
              name: 'childFn1',
              paramIds: ['fn'],
              path: 'c1Path',
              uuidLut: { uuid_0: 0 },
            },
          ],
        );
        expect(originalStackRefs.childFn2).toEqual([
          {
            doesReturnPromise: true,
            injections: [parentInj],
            name: 'parentFn',
            paramIds: ['fn'],
            path: 'parentPath',
            uuidLut: { uuid_0: 0 },
          },
        ]);
        expect(childStacks.childFn2).toEqual(
          [
            {
              doesReturnPromise: true,
              injections: [childInj2],
              name: 'childFn2',
              paramIds: ['fn'],
              path: 'c2Path',
              uuidLut: { uuid_0: 0 },
            },
          ],
        );
        expect(parentFnStack).toEqual(
          [
            {
              doesReturnPromise: true,
              injections: [parentInj, childInj2, childInj1],
              mocks: [],
              name: 'parentFn',
              paramIds: ['fn'],
              path: 'parentPath',
              uuidLut: { uuid_0: 0 },
            },
          ],
        );
      });
      it('should work when in 1 in 1 out 1 out 2', async () => {
        const callStack = [];
        const session = getNamespace(CLS_NAMESPACE);
        const originalStackRefs = {};
        const childStacks = {};
        let parentFnStack = null;
        const child1Meta = { name: 'childFn1', paramIds: ['fn'], path: 'c1Path' };
        const child2Meta = { name: 'childFn2', paramIds: ['fn'], path: 'c2Path' };
        const parentMeta = { name: 'parentFn', paramIds: ['fn'], path: 'parentPath' };
        const childInj1 = {
          UTR_UUID: 'uuid_0',
          fppkey: null,
          paramIndex: 0,
          params: [],
          result: 'childFn1',
        };
        const childInj2 = {
          UTR_UUID: 'uuid_0',
          fppkey: null,
          paramIndex: 0,
          params: [],
          result: 'childFn2',
        };
        const parentInj = {
          UTR_UUID: 'uuid_0',
          fppkey: null,
          paramIndex: 0,
          params: [],
          result: 'parentFn',
        };
        const sampleInj = a => a;
        const childFn = (fn, delay, name) => {
          callStack.push(`${name} - enter`);
          return new Promise(resolve => setTimeout(() => {
            fn(name);
            const stack = session.get('stack');
            const originalStackRef = session.get('originalStackRef');
            childStacks[name] = _.cloneDeep(stack);
            originalStackRefs[name] = _.cloneDeep(originalStackRef);
            callStack.push(`${name} - exit`);
            resolve();
          }, delay));
        };
        const wrappedChild1 = () => boundRecorderWrapper(child1Meta, childFn, sampleInj, 1, 'childFn1');
        const wrappedChild2 = () => boundRecorderWrapper(child2Meta, childFn, sampleInj, 10, 'childFn2');
        const parentFn = async (fn) => {
          const stack = session.get('stack');
          callStack.push('parentFn enter');
          fn('parentFn');
          const p1 = wrappedChild1();
          const p2 = wrappedChild2();
          await Promise.all([p1, p2]);
          parentFnStack = _.cloneDeep(stack);
        };
        const wrappedParent = () => boundRecorderWrapper(parentMeta, parentFn, sampleInj);
        await wrappedParent();
        // Sanity check
        expect(callStack).toEqual([
          'parentFn enter',
          'childFn1 - enter',
          'childFn2 - enter',
          'childFn1 - exit',
          'childFn2 - exit',
        ]);
        expect(originalStackRefs.childFn1).toEqual([
          {
            doesReturnPromise: true,
            injections: [parentInj],
            name: 'parentFn',
            paramIds: ['fn'],
            path: 'parentPath',
            uuidLut: { uuid_0: 0 },
          },
        ]);
        expect(childStacks.childFn1).toEqual(
          [
            {
              doesReturnPromise: true,
              injections: [childInj1],
              name: 'childFn1',
              paramIds: ['fn'],
              path: 'c1Path',
              uuidLut: { uuid_0: 0 },
            },
          ],
        );
        expect(originalStackRefs.childFn2).toEqual([
          {
            doesReturnPromise: true,
            injections: [parentInj, childInj1],
            mocks: [],
            name: 'parentFn',
            paramIds: ['fn'],
            path: 'parentPath',
            uuidLut: { uuid_0: 0 },
          },
        ]);
        expect(childStacks.childFn2).toEqual(
          [
            {
              doesReturnPromise: true,
              injections: [childInj2],
              name: 'childFn2',
              paramIds: ['fn'],
              path: 'c2Path',
              uuidLut: { uuid_0: 0 },
            },
          ],
        );
        expect(parentFnStack).toEqual(
          [
            {
              doesReturnPromise: true,
              injections: [parentInj, childInj1, childInj2],
              mocks: [],
              name: 'parentFn',
              paramIds: ['fn'],
              path: 'parentPath',
              uuidLut: { uuid_0: 0 },
            },
          ],
        );
      });
    });
  });
});

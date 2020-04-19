const { getNamespace } = require('cls-hooked');
const RecorderManager = require('../manager');

const { unBoundRecorderWrapper: recorderWrapper } = require('./wrapper');

describe('user-function-wrapper', () => {
  describe('recorderWrapper', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      RecorderManager.clear();
    });
    it('should set meta and inject sync functions', () => {
      const session = getNamespace('default');
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
        const injections = session.get('injections');
        expect(injections).toEqual([
          [0, null, [], 3],
          [0, null, [], 5],
        ]);
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
                        null,
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
                    "ZsBJ9pvhQdvzyiLigrJ+dg==": true,
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
      const session = getNamespace('default');
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
        const injections = session.get('injections');
        expect(injections).toEqual([
          [0, null, [], 3],
          [0, null, [], 5],
        ]);
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
                        null,
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
                    "ZsBJ9pvhQdvzyiLigrJ+dg==": true,
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
  });
});

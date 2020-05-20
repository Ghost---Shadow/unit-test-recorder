const { createNamespace } = require('./async-hook-provider');

describe('async-hook-provider', () => {
  it('should nest contexts correctly', async () => {
    const session = createNamespace('default');

    const pushSelf = (name) => {
      const stack = session.get('stack') || [];
      stack.push(name);
      session.set('stack', stack);
    };

    const fun2 = async () => {
      pushSelf('fun2');
      expect(session.get('stack')).toEqual(['fun1', 'fun2']);
    };

    const boundFun2 = (...p) => session.bind(fun2, session.createContext())(...p);

    const fun1 = async () => {
      pushSelf('fun1');
      await boundFun2();
      expect(session.get('stack')).toEqual(['fun1']);
    };

    const f1 = (...p) => session.bind(fun1, session.createContext())(...p);

    await f1();
  });
  it('should not double bind', async () => {
    const session = createNamespace('default');

    const pushSelf = (name) => {
      const stack = session.get('stack') || [];
      stack.push(name);
      session.set('stack', stack);
    };

    const fun1 = async () => {
      pushSelf('fun1');
      expect(session.get('stack')).toEqual(['fun1']);
    };

    const f1 = (...p) => session.bind(fun1, session.createContext())(...p);
    const ff1 = (...p) => session.bind(f1)(...p);

    await ff1();
  });
});

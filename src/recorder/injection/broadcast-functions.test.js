const { broadcastFunctions } = require('./broadcast-functions');

describe('broadcast-functions', () => {
  describe('broadcastFunctions', () => {
    it('should broadcast functions with depth 0', () => {
      const oldFn = jest.fn(p => p * 2);
      const newFn = jest.fn(p => p * 2);
      const broadcaster = broadcastFunctions(oldFn, newFn);
      broadcaster(1);
      expect(oldFn).toHaveBeenCalledWith(1);
      expect(newFn).toHaveBeenCalledWith(1);
      expect(oldFn.mock.calls.length).toBe(1);
      expect(newFn.mock.calls.length).toBe(1);
    });
    it('should broadcast functions with higher depth', () => {
      const f1 = jest.fn(p => p * 2);
      const f2 = jest.fn(p => p * 2);
      const f3 = jest.fn(p => p * 2);
      const b1 = broadcastFunctions(f1, f2);
      const b2 = broadcastFunctions(b1, f3);
      b2(1);
      expect(f1).toHaveBeenCalledWith(1);
      expect(f2).toHaveBeenCalledWith(1);
      expect(f3).toHaveBeenCalledWith(1);
      expect(f1.mock.calls.length).toBe(1);
      expect(f2.mock.calls.length).toBe(1);
      expect(f3.mock.calls.length).toBe(1);
    });
  });
});

const { getBlackList } = require("./blacklist-generator");

describe("blacklist-generator", () => {
  describe("getBlackList", () => {
    it("should return an object with boolean values", () => {
      const blackList = getBlackList();
      expect(typeof blackList).toBe("object");
      expect(Object.keys(blackList).length).toBeGreaterThan(50);
      Object.values(blackList).forEach((val) => {
        expect(val).toBe(true);
      });
    });
    it("should contain common built-in method names", () => {
      const blackList = getBlackList();
      // Core methods that exist across all supported Node versions
      const expectedMethods = [
        "apply",
        "bind",
        "call",
        "concat",
        "entries",
        "every",
        "filter",
        "find",
        "forEach",
        "get",
        "has",
        "includes",
        "indexOf",
        "join",
        "keys",
        "map",
        "pop",
        "push",
        "reduce",
        "replace",
        "set",
        "shift",
        "slice",
        "some",
        "sort",
        "splice",
        "split",
        "then",
        "trim",
        "values",
      ];
      expectedMethods.forEach((method) => {
        expect(blackList[method]).toBe(true);
      });
    });
  });
});

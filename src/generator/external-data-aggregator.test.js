const {
  AggregatorManager,
} = require('./external-data-aggregator');

describe('external-data-aggregator', () => {
  beforeEach(() => {
    AggregatorManager.clear();
  });
  describe('validatepath', () => {
    it('should create path if not exists', () => {
      const path = 'newPath';
      AggregatorManager.validatePath(path);
      expect(AggregatorManager.externalData[path]).toEqual([]);
    });
  });
  describe('addExternalData', () => {
    it('should add external data to state', () => {
      const path = 'newPath';
      const externalData = [
        {
          fileString: 'fileString1',
          identifier: 'identifier1',
          filePath: 'filePath1',
          importPath: 'importPath1',
        },
        {
          fileString: 'fileString2',
          identifier: 'identifier2',
          filePath: 'filePath2',
          importPath: 'importPath2',
        },
      ];
      AggregatorManager.addExternalData(path, [externalData[0]]);
      AggregatorManager.addExternalData(path, [externalData[1]]);
      expect(AggregatorManager.externalData[path]).toEqual(externalData);
    });
  });
  describe('getExternalData', () => {
    it('should retrieve external data from path', () => {
      const path = 'newPath';
      const externalData = [
        {
          fileString: 'fileString1',
          identifier: 'identifier1',
          filePath: 'filePath1',
          importPath: 'importPath1',
        },
      ];
      AggregatorManager.addExternalData(path, externalData);
      expect(AggregatorManager.getExternalData(path)).toEqual(externalData);
    });
  });
});

const { newTarget } = require('./08_this');
const { sample } = require('./08_this');

describe('08_this', () => {
  /* This function requires injection of Constructor (WIP)
  describe('newTarget',()=>{
    
  it('test 0', async ()=>{
    const obj = {}
    const result = 42
    const actual = await newTarget(obj);expect(actual).toEqual(result)
  })
  
  })
  */

  describe('sample', () => {
    it('test 0', () => {
      const result = undefined;
      const actual = sample();
      expect(actual).toEqual(result);
    });
  });
});

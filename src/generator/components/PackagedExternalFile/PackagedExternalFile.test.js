const { PackagedExternalFile } = require('./PackagedExternalFile');

describe('PackagedExternalFile', () => {
  it('should generate code for javascript', () => {
    const obj = { a: 42 };
    const packagedArguments = {};
    const props = { obj, packagedArguments };
    const code = PackagedExternalFile(props);
    expect(code).toMatchInlineSnapshot(`
      "module.exports = {
        a: 42
      };
      "
    `);
  });
  it('should generate code for typescript', () => {
    const obj = { a: 42 };
    const packagedArguments = { isTypescript: true };
    const props = { obj, packagedArguments };
    const code = PackagedExternalFile(props);
    expect(code).toMatchInlineSnapshot(`
      "export default {
        a: 42
      };
      "
    `);
  });
});

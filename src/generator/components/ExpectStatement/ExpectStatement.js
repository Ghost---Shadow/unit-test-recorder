const _ = require('lodash');

const ExpectStatement = (props) => {
  const { capture } = props;
  const resultType = _.get(capture, 'types.result');

  const defaultReturn = 'expect(actual).toEqual(result)';
  return {
    Object: 'expect(actual).toMatchObject(result)',
    Function: 'expect(actual.toString()).toEqual(result)',
  }[resultType] || defaultReturn;
};

module.exports = { ExpectStatement };

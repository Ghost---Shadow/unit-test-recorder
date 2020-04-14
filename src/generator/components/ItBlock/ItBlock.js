const { InputAssignment } = require('../InputAssignment/InputAssignment');
const { DependencyInjectionMocking } = require('../DependencyInjectionMocking/DependencyInjectionMocking');
const { InvokeStatement } = require('../InvokeStatement/InvokeStatement');
const { ExpectStatement } = require('../ExpectStatement/ExpectStatement');

const ItBlock = (props) => {
  const {
    meta,
    captureIndex,
    // functionIdentifier, // Required by children
    // packagedArguments, // Required by children
    // capture, // Required by children
  } = props;
  const { doesReturnPromise } = meta;
  const asyncString = doesReturnPromise ? 'async ' : '';
  return `
  it('should work for case ${captureIndex + 1}', ${asyncString}()=>{
    ${InputAssignment(props)}
    ${DependencyInjectionMocking(props)}
    ${InvokeStatement(props)}
    ${ExpectStatement(props)}
  })
  `;
};

module.exports = { ItBlock };

module.exports = (/* { types: t } */) => ({
  name: 'unit-test-recorder',
  visitor: {
    Identifier(path) {
      path.node.name = path.node.name.split('').reverse().join('');
    },
  },
});

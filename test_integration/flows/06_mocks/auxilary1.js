const foo1 = () => 1;

const foo2 = () => new Promise((resolve) => {
  setTimeout(() => {
    resolve(2);
  }, 1);
});

module.exports = { foo1, foo2 };

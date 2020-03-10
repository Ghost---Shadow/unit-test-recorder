const { recorderWrapper } = require('../../../src/recorder'); // const axios = require('axios');

// const getTodo = id => axios.get(`https://jsonplaceholder.typicode.com/todos/${id}`).then(res => res.data);
const getTodo = (...p) =>
  recorderWrapper(
    {
      path: 'test_integration/flows/06_mocks/06_mocks.js',
      name: 'getTodo',
      paramIds: 'id',
      isDefault: true,
      isEcmaDefault: true,
      isAsync: false
    },
    id =>
      Promise.resolve({
        userId: 1,
        id,
        title: 'delectus aut autem',
        completed: false
      }),
    ...p
  );

export default getTodo;

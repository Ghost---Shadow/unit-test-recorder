// const axios = require('axios');

// const getTodo = id => axios.get(`https://jsonplaceholder.typicode.com/todos/${id}`).then(res => res.data);
const getTodo = id => Promise.resolve({
  userId: 1,
  id,
  title: 'delectus aut autem',
  completed: false,
});

export default getTodo;

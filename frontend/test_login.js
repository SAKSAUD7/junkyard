const axios = require('axios');
axios.post('http://localhost:8000/api/auth/login/', {
  email: 'admin@jynm.com',
  password: 'admin123'
}, {
  headers: {
    'Origin': 'http://localhost:3000'
  }
}).then(res => console.log('SUCCESS'))
  .catch(err => console.log('ERROR:', err.response ? err.response.data : err.message));

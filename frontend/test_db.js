import axios from 'axios';
axios.get('http://127.0.0.1:8000/api/hollander/parts/')
  .then(res => console.log('Parts:', res.data.results.slice(0, 3)))
  .catch(err => console.log('Err parts:', err.message));
axios.get('http://127.0.0.1:8000/api/hollander/makes/')
    .then(res => console.log('Makes:', res.data.results.slice(0, 3)))
    .catch(err => console.log('Err makes:', err.message));

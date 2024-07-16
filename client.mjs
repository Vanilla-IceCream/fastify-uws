import axios from 'axios';

async function request() {
  const response = await axios.get('http://127.0.0.1:3000/api/hello-http');

  console.log(response.data);
}

request();

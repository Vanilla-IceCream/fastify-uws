import fs from 'node:fs';
import axios from 'axios';
import FormData from 'form-data';

async function upload() {
  const formData = new FormData();
  formData.append('image', fs.createReadStream('./.github/assets/logo.png'));

  const response = await axios.post('http://127.0.0.1:3000/api/hello-fd', formData, {
    headers: { ...formData.getHeaders() },
  });

  console.log(response.data);
}

upload();

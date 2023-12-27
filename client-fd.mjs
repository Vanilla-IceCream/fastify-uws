import fs from 'fs';
import { ofetch } from 'ofetch';
import FormData from 'form-data';

async function upload() {
  const formData = new FormData();
  formData.append('file', fs.createReadStream('/fastify.png'));

  await ofetch('/api/hello-fd', {
    method: 'POST',
    body: formData,
  });
}

upload();

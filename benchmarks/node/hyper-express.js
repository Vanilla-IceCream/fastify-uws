import { Server, Router } from 'hyper-express';

const router = new Router();

router.get('/hello-world', async (request, response) => {
  return response.json({ message: 'Hello, World!' });
});

const server = new Server();

server.use('/api', router);

server.listen(3000, '127.0.0.1').then(() => {
  console.log(`Server listening at http://127.0.0.1:3000`);
});

// $ node hyper-express.js
// $ curl http://127.0.0.1:3000/api/hello-world

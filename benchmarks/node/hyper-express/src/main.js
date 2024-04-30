import { Router, Server } from 'hyper-express';

const router = new Router();

router.get('/hello-world', async (request, response) => {
  return response.json({ message: 'Hello, World!' });
});

const server = new Server();

server.use('/api', router);

server.listen(3000, '0.0.0.0').then(() => {
  console.log(`Server listening at http://0.0.0.0:3000`);
});

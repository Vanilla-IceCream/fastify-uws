import nhttp from 'nhttp';

const router = nhttp.Router();

router.get('/hello-world', () => {
  return { message: 'Hello, World!' };
});

const app = nhttp();

app.use('/api', router);

app.listen({ hostname: '0.0.0.0', port: 3000 }, (_, { hostname, port }) => {
  console.log(`Server listening at http://${hostname}:${port}`);
});

import polka from 'polka';

const router = polka();

router.get('/hello-world', async (request, response) => {
  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify({ message: 'Hello, World!' }));
});

const app = polka();

app.use('/api', router);

app.listen(3000, '127.0.0.1', () => {
  console.log(`Server listening at http://127.0.0.1:3000`);
});

// $ node polka.js
// $ curl http://127.0.0.1:3000/api/hello-world

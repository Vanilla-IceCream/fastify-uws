import polka from 'polka';

const router = polka();

router.get('/hello-world', async (request, response) => {
  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify({ message: 'Hello, World!' }));
});

const app = polka();

app.use('/api', router);

app.listen(3000, '0.0.0.0', () => {
  console.log(`Server listening at http://0.0.0.0:3000`);
});

process.on('SIGINT', () => {
  process.exit();
});

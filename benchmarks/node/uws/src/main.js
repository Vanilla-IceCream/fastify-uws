import uws from 'uWebSockets.js';

const app = uws.App();

const server = app.get('/api/hello-world', (response) => {
  response.writeStatus('200 OK');
  response.writeHeader('Content-Type', 'application/json');
  response.end(JSON.stringify({ message: 'Hello, World!' }));
});

server.listen('0.0.0.0', 3000, () => {
  console.log(`Server listening at http://0.0.0.0:3000`);
});

process.on('SIGINT', () => {
  process.exit();
});

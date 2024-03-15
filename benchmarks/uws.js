import uws from 'uWebSockets.js';

const app = uws.App();

const server = app.get('/api/hello-world', (response) => {
  response.writeStatus('200 OK');
  response.writeHeader('Content-Type', 'application/json');
  response.end(JSON.stringify({ message: 'Hello, World!' }));
});

server.listen('127.0.0.1', 3000, () => {
  console.log(`Server listening at http://127.0.0.1:3000`);
});

// $ node uws.js
// $ curl http://127.0.0.1:3000/api/hello-world

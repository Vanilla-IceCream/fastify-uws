import http from 'node:http';

const server = http.createServer((request, response) => {
  if (request.url === '/api/hello-world') {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ message: 'Hello, World!' }));
  } else {
    response.writeHead(404, { 'Content-Type': 'text/plain' });
    response.end('Not Found');
  }
});

server.listen(3000, '127.0.0.1', () => {
  console.log(`Server listening at http://127.0.0.1:3000`);
});

// $ node node.js
// $ curl http://127.0.0.1:3000/api/hello-world

import http from 'node:http';

const server = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify({ message: 'Hello, World!' }));
});

server.listen(3000, '127.0.0.1', () => {
  console.log(`Server listening at http://127.0.0.1:3000`);
});

// $ node node.mjs

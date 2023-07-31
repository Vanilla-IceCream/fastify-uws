import WebSocket from 'ws';

const ws = new WebSocket('ws://127.0.0.1:3000/api/hello-ws');

ws.on('error', console.error);

ws.on('open', () => {
  ws.send('something');
});

ws.on('message', (data) => {
  console.log('received: %s', data);
});

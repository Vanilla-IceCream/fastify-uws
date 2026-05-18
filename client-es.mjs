import { EventSource } from 'eventsource';

const es = new EventSource('http://127.0.0.1:3000/api/hello-sse');

es.addEventListener('message', (evt) => {
  console.log(evt.data);
});

// const es = new EventSource('http://127.0.0.1:3000/api/hello-sse/count');

// es.addEventListener('message', (evt) => {
//   console.log(evt.data);
// });

// es.addEventListener('end', () => {
//   console.log('Done');
//   es.close();
// });

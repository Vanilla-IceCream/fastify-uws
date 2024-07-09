import express from 'express';

const router = express.Router();

router.get('/hello-world', (_, res) => {
  res.json({ message: 'Hello, World!' });
});

const app = express();

app.use('/api', router);

app.listen(3000, '0.0.0.0', () => {
  console.log(`Server listening at http://0.0.0.0:3000`);
});

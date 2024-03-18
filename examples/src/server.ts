import app from './app';

const server = app();

const start = async () => {
  try {
    await server.listen({ host: '127.0.0.1', port: 3000 });
  } catch (err) {
    server.log.error(err);

    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }

  if (import.meta.hot) {
    import.meta.hot.on('vite:beforeFullReload', async () => {
      await server.close();
    });

    import.meta.hot.dispose(async () => {
      await server.close();
    });
  }
};

start();

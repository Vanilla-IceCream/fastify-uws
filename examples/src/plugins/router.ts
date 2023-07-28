import plugin from 'fastify-plugin';

export default plugin(
  async (app, opts) => {
    const { prefix = '/api' } = opts;

    app.register(import('~/routes/hello-http/+handler'), { prefix: prefix + '/hello-http' });
    // app.register(import('~/routes/hello-ws/+handler'), { prefix: prefix + '/hello-ws' });
    // app.register(import('~/routes/hello-sse/+handler'), { prefix: prefix + '/hello-sse' });
  },
  { name: 'router' },
);

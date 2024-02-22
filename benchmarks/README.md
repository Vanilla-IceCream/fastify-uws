### Benchmarks

```sh
$ autocannon -c 100 -p 10 -d 40 http://127.0.0.1:3000 # (two rounds; one to warm-up, one to measure)
```

|             | Version | Req/Sec (Avg) |
| :---------- | ------: | ------------: |
| bun         |  1.0.28 |    270,155.20 |
| deno        |  1.41.0 |    266,790.41 |
| uws         | 20.41.0 |    254,153.60 |
| fastify-uws |   0.4.0 |    242,409.60 |
| node        | 20.11.1 |    142,995.21 |
| fastify     |  4.26.1 |    128,088.00 |

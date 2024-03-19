import { join } from 'https://deno.land/std@0.220.1/path/mod.ts';

type Language = 'bun' | 'deno' | 'node' | 'rust';

interface Target {
  name: string;
  version: string;
  language?: string;
  router: boolean;
  requestsPerSec?: number;
}

const targets: Record<Language, Target[]> = {
  bun: [
    { name: 'bun', version: '1.0.30', router: false },
    { name: 'elysia', version: '1.0.4', router: true },
    { name: 'h3', version: '1.11.1', router: true },
    { name: 'hono', version: '4.1.0', router: true },
    { name: 'oak', version: '14.2.0', router: true },
  ],
  deno: [
    { name: 'deno', version: '1.41.3', router: false },
    { name: 'drash', version: '3.0.0-beta.2', router: true },
    { name: 'h3', version: '1.11.1', router: true },
    { name: 'hono', version: '4.1.0', router: true },
    { name: 'oak', version: '14.2.0', router: true },
  ],
  node: [
    { name: 'fastify-uws', version: '0.6.1', router: true },
    { name: 'fastify', version: '4.26.2', router: true },
    { name: 'h3', version: '1.11.1', router: true },
    { name: 'hono', version: '4.1.0', router: true },
    { name: 'hyper-express', version: '6.14.12', router: true },
    { name: 'node', version: '20.11.1', router: false },
    { name: 'oak', version: '14.2.0', router: true },
    { name: 'polka', version: '1.0.0-next.25', router: true },
    { name: 'uws', version: '20.42.0', router: true },
  ],
  rust: [
    { name: 'actix-web', version: '4.5.1', router: true },
    { name: 'axum', version: '0.7.4', router: true },
    { name: 'graphul', version: '1.0.1', router: true },
    { name: 'poem', version: '2.0.1', router: true },
    { name: 'rocket', version: '0.5.0', router: true },
    { name: 'salvo', version: '0.66.2', router: true },
    { name: 'viz', version: '0.8.3', router: true },
    { name: 'warp', version: '0.3.6', router: true },
  ],
};

async function oha(target: Target) {
  const cmd = new Deno.Command('oha', {
    args: ['-c', '100', '-z', '30s', '--no-tui', '-j', 'http://127.0.0.1:3000/api/hello-world'],
    stdin: 'null',
    stdout: 'piped',
    stderr: 'null',
  });

  const decoder = new TextDecoder();
  const output = decoder.decode((await cmd.output()).stdout);

  return JSON.parse(output).summary.requestsPerSec;
}

const header = `| | Version | Language | Router | Requests/sec |`;
const alignment = `| :- | -: | :- | -: | -: |`;

function row(target: Target) {
  const row = `| ${target.name} | ${target.version} | ${target.language} | ${
    target.router ? '✓' : '✗'
  } | ${target.requestsPerSec?.toLocaleString()} |\n`;

  return row;
}

async function bench() {
  for (const lang in targets) {
    for (const target of targets[lang]) {
      if (lang === 'bun') {
        const serverAbortController = new AbortController();

        target.language = 'TypeScript/Bun';

        const server = new Deno.Command('bun', {
          args: [`${target.name}.ts`],
          cwd: join(import.meta.dirname, './bun'),
          stdin: 'inherit',
          stdout: 'inherit',
          stderr: 'inherit',
          signal: serverAbortController.signal,
        });

        server.spawn();

        await new Promise((resolve) => setTimeout(resolve, 5000));
        target.requestsPerSec = await oha(target);

        serverAbortController.abort();
      }

      if (lang === 'deno') {
        const serverAbortController = new AbortController();

        target.language = 'TypeScript/Deno';

        const server = new Deno.Command('deno', {
          args: ['run', '-A', `${target.name}.ts`],
          cwd: join(import.meta.dirname, './deno'),
          stdin: 'inherit',
          stdout: 'inherit',
          stderr: 'inherit',
          signal: serverAbortController.signal,
        });

        server.spawn();

        await new Promise((resolve) => setTimeout(resolve, 5000));
        target.requestsPerSec = await oha(target);

        serverAbortController.abort();
      }

      if (lang === 'node') {
        const serverAbortController = new AbortController();

        target.language = 'JavaScript/Node';

        const server = new Deno.Command('node', {
          args: [`${target.name}.js`],
          cwd: join(import.meta.dirname, './node'),
          stdin: 'inherit',
          stdout: 'inherit',
          stderr: 'inherit',
          signal: serverAbortController.signal,
        });

        server.spawn();

        await new Promise((resolve) => setTimeout(resolve, 5000));
        target.requestsPerSec = await oha(target);

        serverAbortController.abort();
      }

      if (lang === 'rust') {
        const serverAbortController = new AbortController();

        target.language = 'Rust';

        const server = new Deno.Command('cargo', {
          args: ['run'],
          cwd: join(import.meta.dirname, './rust', target.name),
          stdin: 'inherit',
          stdout: 'inherit',
          stderr: 'inherit',
          signal: serverAbortController.signal,
        });

        server.spawn();

        await new Promise((resolve) => setTimeout(resolve, 5000));
        target.requestsPerSec = await oha(target);

        serverAbortController.abort();
      }
    }
  }

  const flattened = Object.values(targets).flatMap((target) => target);
  flattened.sort((a, b) => Number(b.requestsPerSec) - Number(a.requestsPerSec));

  let md = '';
  md += `${header}\n`;
  md += `${alignment}\n`;

  for (const item of flattened) {
    md += row(item);
  }

  await Deno.writeTextFile('./result.md', md);
}

bench();

// $ deno run -A bench.ts

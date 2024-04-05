import { delay } from 'jsr:@std/async';
import { join } from 'jsr:@std/path';

import type { Target } from './config.ts';
import { targets } from './config.ts';

async function oha() {
  const cmd = new Deno.Command('oha', {
    args: ['-c', '100', '-z', '30s', '--no-tui', '-j', 'http://127.0.0.1:3000/api/hello-world'],
    stdin: 'null',
    stdout: 'piped',
    stderr: 'null',
  });

  const decoder = new TextDecoder();
  const output = decoder.decode((await cmd.output()).stdout);
  const report = JSON.parse(output);
  const status = Object.keys(report.statusCodeDistribution);

  if (status.length === 1 && status[0] === '200') {
    return report.summary.requestsPerSec;
  }

  return undefined;
}

const header = `| | Version | Language | Router | Requests/sec |`;
const alignment = `| :- | -: | :- | -: | -: |`;

function row(target: Target) {
  const row = `| ${target.name} | ${target.version} | ${target.language} | ${
    target.router ? '✓' : '✗'
  } | ${target.requestsPerSec?.toLocaleString(undefined, { minimumFractionDigits: 4 })} |\n`;

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

        await delay(5000);
        target.requestsPerSec = await oha();

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

        await delay(5000);
        target.requestsPerSec = await oha();

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

        await delay(5000);
        target.requestsPerSec = await oha();

        serverAbortController.abort();
      }

      if (lang === 'rust') {
        const serverAbortController = new AbortController();

        target.language = 'Rust';

        const server = new Deno.Command('cargo', {
          args: ['run', '--release'],
          cwd: join(import.meta.dirname, './rust', target.name),
          stdin: 'inherit',
          stdout: 'inherit',
          stderr: 'inherit',
          signal: serverAbortController.signal,
        });

        server.spawn();

        await delay(5000);
        target.requestsPerSec = await oha();

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

import { delay } from 'jsr:@std/async';
import { join } from 'jsr:@std/path';
import { parse } from 'jsr:@std/toml';

import bunPkg from './bun/package.json' assert { type: 'json' };
import denoPkg from './deno/deno.json' assert { type: 'json' };
import nodePkg from './node/package.json' assert { type: 'json' };
import fastifyUwsPkg from '../package.json' assert { type: 'json' };

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
    { name: 'bun', version: '1.0.33', router: false },
    { name: 'elysia', version: bunPkg.dependencies.elysia, router: true },
    { name: 'h3', version: bunPkg.dependencies.h3, router: true },
    { name: 'hono', version: bunPkg.dependencies.hono, router: true },
    { name: 'oak', version: versionify(bunPkg.dependencies['@oak/oak']), router: true },
  ],
  deno: [
    { name: 'deno', version: '1.41.3', router: false },
    { name: 'drash', version: versionify(denoPkg.imports.drash), router: true },
    { name: 'h3', version: versionify(denoPkg.imports.h3), router: true },
    { name: 'hono', version: versionify(denoPkg.imports.hono), router: true },
    { name: 'oak', version: versionify(denoPkg.imports['@oak/oak']), router: true },
  ],
  node: [
    { name: 'fastify-uws', version: fastifyUwsPkg.version, router: true },
    { name: 'fastify', version: nodePkg.dependencies.fastify, router: true },
    { name: 'h3', version: nodePkg.dependencies.h3, router: true },
    { name: 'hono', version: nodePkg.dependencies.hono, router: true },
    { name: 'hyper-express', version: nodePkg.dependencies['hyper-express'], router: true },
    { name: 'node', version: '20.11.1', router: false },
    { name: 'polka', version: nodePkg.dependencies.polka, router: true },
    { name: 'uws', version: versionify(nodePkg.dependencies['uWebSockets.js']), router: false },
  ],
  rust: [
    { name: 'actix-web', version: rustPkg('actix-web'), router: true },
    { name: 'axum', version: rustPkg('axum'), router: true },
    { name: 'graphul', version: rustPkg('graphul'), router: true },
    { name: 'poem', version: rustPkg('poem'), router: true },
    { name: 'rocket', version: rustPkg('rocket'), router: true },
    { name: 'salvo', version: rustPkg('salvo'), router: true },
    { name: 'viz', version: rustPkg('viz'), router: true },
    { name: 'warp', version: rustPkg('warp'), router: true },
  ],
};

function versionify(version: string) {
  const match = version.match(/(?:@|v)([\d.]+(?:-beta\.\d+)?)(?:$|\/)/);
  return match ? match[1] : '';
}

function rustPkg(name: string) {
  const version = parse(Deno.readTextFileSync(`./rust/${name}/Cargo.toml`)).dependencies[name];
  if (isObject(version)) return version.version;
  return version;
}

function isObject(value: any): boolean {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

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

// $ deno run -A bench.ts

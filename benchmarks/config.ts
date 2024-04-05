import { parse } from 'jsr:@std/toml';

import bunPkg from './bun/package.json' assert { type: 'json' };
import denoPkg from './deno/deno.json' assert { type: 'json' };
import nodePkg from './node/package.json' assert { type: 'json' };

type Language = 'bun' | 'deno' | 'node' | 'rust';

export interface Target {
  name: string;
  version: string;
  language?: string;
  router: boolean;
  requestsPerSec?: number;
}

export const targets: Record<Language, Target[]> = {
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
    { name: 'fastify-uws', version: nodePkg.dependencies['fastify-uws'], router: true },
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

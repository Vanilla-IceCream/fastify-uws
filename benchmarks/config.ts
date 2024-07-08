import { parse } from 'jsr:@std/toml';

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
    { name: 'bun', version: '1.1.18', router: false },
    { name: 'elysia', version: bunPkg('elysia'), router: true },
    { name: 'h3', version: bunPkg('h3'), router: true },
    { name: 'hono', version: bunPkg('hono'), router: true },
    { name: 'oak', version: bunPkg('oak', '@oak/oak'), router: true },
  ],
  deno: [
    { name: 'deno', version: '1.44.4', router: false },
    { name: 'drash', version: denoPkg('drash'), router: true },
    // { name: 'h3', version: denoPkg('h3'), router: true },
    { name: 'hono', version: denoPkg('hono'), router: true },
    { name: 'oak', version: denoPkg('oak', '@oak/oak'), router: true },
  ],
  node: [
    { name: 'fastify', version: nodePkg('fastify'), router: true },
    { name: 'fastify-uws', version: nodePkg('fastify-uws'), router: true },
    { name: 'h3', version: nodePkg('h3'), router: true },
    { name: 'hono', version: nodePkg('hono'), router: true },
    { name: 'hyper-express', version: nodePkg('hyper-express'), router: true },
    { name: 'node', version: '20.15.0', router: false },
    { name: 'polka', version: nodePkg('polka'), router: true },
    { name: 'uws', version: nodePkg('uws', 'uWebSockets.js'), router: false },
  ],
  rust: [
    { name: 'actix-web', version: rustPkg('actix-web'), router: true },
    { name: 'axum', version: rustPkg('axum'), router: true },
    { name: 'graphul', version: rustPkg('graphul'), router: true },
    { name: 'hyper', version: rustPkg('hyper'), router: false },
    { name: 'poem', version: rustPkg('poem'), router: true },
    { name: 'rocket', version: rustPkg('rocket'), router: true },
    { name: 'salvo', version: rustPkg('salvo'), router: true },
    { name: 'viz', version: rustPkg('viz'), router: true },
    { name: 'warp', version: rustPkg('warp'), router: true },
  ],
};

function bunPkg(name: string, pkg?: string) {
  const json = Deno.readTextFileSync(`./bun/${name}/package.json`);
  const version = JSON.parse(json).dependencies[pkg ? pkg : name];
  return versionify(version);
}

function denoPkg(name: string, pkg?: string) {
  const json = Deno.readTextFileSync(`./deno/${name}/deno.json`);
  const version = JSON.parse(json).imports[pkg ? pkg : name];
  return versionify(version);
}

function nodePkg(name: string, pkg?: string) {
  const json = Deno.readTextFileSync(`./node/${name}/package.json`);
  const version = JSON.parse(json).dependencies[pkg ? pkg : name];
  return versionify(version);
}

function rustPkg(name: string) {
  const toml = Deno.readTextFileSync(`./rust/${name}/Cargo.toml`);
  const version = parse(toml).dependencies[name];
  if (isObject(version)) return version.version;
  return version;
}

function versionify(version: string) {
  const match = version.match(/(?:@|v)([\d.]+(?:-beta\.\d+)?)(?:$|\/)/);
  return match ? match[1] : version;
}

function isObject(value: any): boolean {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

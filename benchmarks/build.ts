import { join } from 'jsr:@std/path';

import { targets } from './config.ts';

async function build() {
  const images = ['oven/bun:1.1.1', 'denoland/deno:1.42.1', 'node:20.12.1', 'rust:1.77.1'];
  const pulls = [] as Promise<Deno.CommandOutput>[];

  for (const image of images) {
    const pull = new Deno.Command('docker', {
      args: ['pull', image],
      cwd: import.meta.dirname,
      stdin: 'inherit',
      stdout: 'inherit',
      stderr: 'inherit',
    });

    pulls.push(pull.output());
  }

  await Promise.all(pulls);

  const builds = [] as Promise<Deno.CommandOutput>[];

  for (const lang in targets) {
    for (const target of targets[lang]) {
      const build = new Deno.Command('docker', {
        args: ['build', '-t', `${lang}-${target.name}`, '.'],
        cwd: join(import.meta.dirname, `./${lang}/${target.name}`),
        stdin: 'inherit',
        stdout: 'inherit',
        stderr: 'inherit',
      });

      builds.push(build.output());
    }
  }

  await Promise.all(builds);
}

build();

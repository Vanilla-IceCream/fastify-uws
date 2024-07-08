import { join } from 'jsr:@std/path';

import { targets } from './config.ts';

async function build() {
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

import { join } from 'jsr:@std/path';

import { targets } from './config.ts';

async function build() {
  for (const lang in targets) {
    for (const target of targets[lang]) {
      const build = new Deno.Command('docker', {
        args: ['build', '-t', `${lang}-${target.name}`, '.'],
        cwd: join(import.meta.dirname, `./${lang}/${target.name}`),
        stdin: 'inherit',
        stdout: 'inherit',
        stderr: 'inherit',
      });

      await build.output();
    }
  }
}

build();

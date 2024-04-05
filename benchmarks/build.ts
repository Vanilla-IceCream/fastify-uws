import { join } from 'jsr:@std/path';

import { targets } from './config.ts';

async function build() {
  const cmds = [] as Promise<Deno.CommandOutput>[];

  for (const lang in targets) {
    for (const target of targets[lang]) {
      if (lang === 'rust') {
        const cmd = new Deno.Command('docker', {
          args: ['build', '-t', `${lang}-${target.name}`, '.'],
          cwd: join(import.meta.dirname, `./${lang}/${target.name}`),
          stdin: 'inherit',
          stdout: 'inherit',
          stderr: 'inherit',
        });

        cmds.push(cmd.output());
      }
    }
  }

  await Promise.all(cmds);
}

build();

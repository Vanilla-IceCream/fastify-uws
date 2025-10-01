import { delay } from '@std/async';

import { targets } from './config.ts';

async function warmUp() {
  for (const lang in targets) {
    for (const target of targets[lang]) {
      const run = new Deno.Command('docker', {
        args: [
          'run',
          '--init',
          '--name',
          `${lang}-${target.name}`,
          '-dit',
          '-p',
          '3000:3000',
          `${lang}-${target.name}`,
        ].filter(Boolean),
        cwd: import.meta.dirname,
        stdin: 'inherit',
        stdout: 'inherit',
        stderr: 'inherit',
      });

      await run.output();
      await delay(3000);

      const stop = new Deno.Command('docker', {
        args: ['stop', `${lang}-${target.name}`],
        cwd: import.meta.dirname,
        stdin: 'inherit',
        stdout: 'inherit',
        stderr: 'inherit',
      });

      await stop.output();
      await delay(1000);
    }
  }
}

warmUp();

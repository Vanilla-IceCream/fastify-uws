import { delay } from 'jsr:@std/async';

import type { Target } from './config.ts';
import { targets } from './config.ts';

async function oha() {
  const cmd = new Deno.Command('oha', {
    args: ['-c', '500', '-z', '10s', '--no-tui', '-j', 'http://127.0.0.1:3000/api/hello-world'],
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

  return '';
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
      const serverAbortController = new AbortController();

      if (lang === 'rust') target.language = 'Rust';
      if (lang === 'bun') target.language = 'TypeScript/Bun';
      if (lang === 'deno') target.language = 'TypeScript/Deno';
      if (lang === 'node') target.language = 'JavaScript/Node';

      console.log(`🚀 Start: ${target.name} (${target.language})`);
      const server = new Deno.Command('docker', {
        args: ['run', '--init', '-it', '-p', '3000:3000', `${lang}-${target.name}`],
        cwd: import.meta.dirname,
        stdin: 'inherit',
        stdout: 'null',
        stderr: 'inherit',
        signal: serverAbortController.signal,
      });

      server.spawn();

      console.log(`🎯 Benching...`);
      await delay(3000);
      target.requestsPerSec = await oha();

      serverAbortController.abort();
      await delay(3000);
      console.log(`✅ Done.`);
      console.log();
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

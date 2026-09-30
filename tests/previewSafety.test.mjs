import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
const cases = [
  ['preview', 'integracao/checkouts-parceiros', true],
  ['preview', 'master', true],
  ['production', 'master', true],
  ['production', 'integracao/checkouts-parceiros', false],
  ['production', 'outra-branch', false],
  ['production', undefined, false],
  ['development', 'master', false],
  [undefined, undefined, false],
  ['', '', false],
];
function run(command, environment, branch) {
  const env = { ...process.env };
  for (const [name, value] of [['VERCEL_ENV', environment], ['VERCEL_GIT_COMMIT_REF', branch]]) {
    if (value === undefined) delete env[name]; else env[name] = value;
  }
  const result = spawnSync('/bin/sh', ['-c', command], { env, encoding: 'utf8', timeout: 5000 });
  assert.equal(result.error, undefined);
  return result.status;
}

test('Vercel permite prévias e produção somente pela master, nunca pela branch de teste', () => {
  for (const [environment, branch, allowed] of cases) {
    assert.equal(run(config.ignoreCommand, environment, branch), allowed ? 1 : 0, `${environment}/${branch}`);
  }
});

test('a compilação também bloqueia produção de branch errada ou ambiente desconhecido', () => {
  assert.ok(config.buildCommand.endsWith(' && npm run build'));
  const guard = config.buildCommand.slice(0, -' && npm run build'.length);
  for (const [environment, branch, allowed] of cases) {
    assert.equal(run(guard, environment, branch), allowed ? 0 : 1, `${environment}/${branch}`);
  }
});

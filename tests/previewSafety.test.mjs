import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
const run = (command, envValue) => {
  const env = { ...process.env };
  if (envValue === undefined) delete env.VERCEL_ENV;
  else env.VERCEL_ENV = envValue;
  return spawnSync('/bin/sh', ['-c', command], { env, encoding: 'utf8', timeout: 5000 }).status;
};

test('a etapa de validação só solicita builds de preview na Vercel', () => {
  assert.equal(run(config.ignoreCommand, 'preview'), 1);
  for (const value of ['production', 'development', '', undefined]) {
    assert.equal(run(config.ignoreCommand, value), 0);
  }
});

test('a trava adicional de compilação recusa produção ou ambiente desconhecido', () => {
  assert.ok(config.buildCommand.endsWith(' && npm run build'));
  const guard = config.buildCommand.slice(0, -' && npm run build'.length);
  assert.equal(run(guard, 'preview'), 0);
  for (const value of ['production', 'development', '', undefined]) {
    assert.notEqual(run(guard, value), 0);
  }
});

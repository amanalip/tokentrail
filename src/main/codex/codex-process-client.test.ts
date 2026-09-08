// @vitest-environment node
import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { version } from '../../../package.json';
import { CodexProcessClient } from './codex-process-client';
import { CODEX_PROTOCOL_LIMITS } from './protocol-limits';

const mocks = vi.hoisted(() => ({ spawn: vi.fn(), access: vi.fn() }));
vi.mock('node:child_process', () => ({ spawn: mocks.spawn }));
vi.mock('node:fs/promises', () => ({ access: mocks.access }));

function fixture() {
  const child = Object.assign(new EventEmitter(), {
    stdin: new PassThrough(),
    stdout: new PassThrough(),
    stderr: new PassThrough(),
    exitCode: null as number | null,
    signalCode: null as string | null,
    kill: vi.fn(),
  });
  mocks.spawn.mockReturnValue(child);
  const client = new CodexProcessClient({ executablePath: '/fixture' });
  const start = client.start();
  child.stdout.write(
    JSON.stringify({
      id: 1,
      result: { userAgent: 'fixture', platformFamily: 'unix', platformOs: 'linux' },
    }) + '\n',
  );
  return { child, client, start };
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  vi.resetAllMocks();
});

describe('process ownership and framing', () => {
  it('does not spawn after stop during executable discovery or allow concurrent starts', async () => {
    let resolve!: () => void;
    mocks.access.mockReturnValue(
      new Promise<void>((done) => {
        resolve = done;
      }),
    );
    const client = new CodexProcessClient();
    const starting = client.start();
    await expect(client.start()).rejects.toMatchObject({ category: 'internal-error' });
    client.stop();
    resolve();
    await expect(starting).rejects.toMatchObject({ category: 'codex-unavailable' });
    expect(mocks.spawn).not.toHaveBeenCalled();
  });

  it('sanitizes asynchronous stdin failures and settles pending requests', async () => {
    const { child, client, start } = fixture();
    await start;
    const pending = client.request('account/read', {});
    child.stdin.emit('error', new Error('EPIPE private details'));
    await expect(pending).rejects.toMatchObject({ category: 'codex-unavailable' });
    expect(child.kill).toHaveBeenCalledWith('SIGTERM');
    child.emit('exit');
  });

  it('escalates only the owned child and cancels escalation on exit', async () => {
    const { child, client, start } = fixture();
    await start;
    client.stop();
    client.stop();
    expect(child.kill).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1_000);
    expect(child.kill).toHaveBeenLastCalledWith('SIGKILL');
    child.emit('exit');
    expect(vi.getTimerCount()).toBe(0);

    const next = fixture();
    await next.start;
    next.client.stop();
    next.child.emit('exit');
    await vi.advanceTimersByTimeAsync(1_000);
    expect(next.child.kill).toHaveBeenCalledTimes(1);
  });

  it('advertises the manifest version', async () => {
    const { child, client, start } = fixture();
    await start;
    expect(child.stdin.read().toString()).toContain(`"version":"${version}"`);
    client.stop();
    child.emit('exit');
  });

  it.each([1, 500_000, CODEX_PROTOCOL_LIMITS.maximumMessageBytes - 1])(
    'accepts individually bounded lines split at %i bytes',
    async (split) => {
      const { child, client, start } = fixture();
      await start;
      const listener = vi.fn();
      client.onNotification('account/rateLimits/updated', listener);
      // Whitespace keeps a valid response near the byte limit without exceeding string limits.
      const line = JSON.stringify({ id: 2, result: null }).padEnd(
        CODEX_PROTOCOL_LIMITS.maximumMessageBytes,
        ' ',
      );
      const message =
        line + '\n' + JSON.stringify({ method: 'account/rateLimits/updated', params: {} }) + '\n';
      const pending = client.request('account/read', {});
      child.stdout.write(message.slice(0, split));
      child.stdout.write(message.slice(split));
      await expect(pending).resolves.toBeNull();
      expect(listener).toHaveBeenCalledTimes(1);
      client.stop();
      child.emit('exit');
    },
  );

  it('rejects an oversized incomplete line', async () => {
    const { child, client, start } = fixture();
    await start;
    const pending = client.request('account/read', {});
    child.stdout.write(' '.repeat(CODEX_PROTOCOL_LIMITS.maximumMessageBytes + 1));
    await expect(pending).rejects.toMatchObject({ category: 'invalid-response' });
    child.emit('exit');
  });
});

it.each([
  [-32601, 'codex-incompatible'],
  [-32603, 'codex-unavailable'],
])('distinguishes method absence from server error %i', async (code, category) => {
  const { child, client, start } = fixture();
  await start;
  const request = client.request('account/usage/read', undefined);
  child.stdout.write(
    JSON.stringify({ id: 2, error: { code, message: 'private server details' } }) + '\n',
  );
  await expect(request).rejects.toMatchObject({ category });
  client.stop();
  child.emit('exit');
});

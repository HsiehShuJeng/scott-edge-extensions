import { afterEach, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

vi.mock('./modules/core/index.js', () => ({ initializeUI: vi.fn(), showNotification: vi.fn() }));

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('initializes PE with the real video detector when the active tab URL is unavailable', async () => {
  document.body.innerHTML = readFileSync(path.join(__dirname, 'popup.html'), 'utf8');
  const query = vi.fn().mockResolvedValue([{ id: 12 }]);
  const executeScript = vi.fn();
  const logError = vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.stubGlobal('chrome', {
    tabs: { query }, scripting: { executeScript },
    runtime: { onMessage: { addListener: vi.fn() } },
    storage: { local: { get: (_key, callback) => callback({ theme: 'light' }), set: vi.fn() } },
  });
  await import('./popup.js');
  document.dispatchEvent(new Event('DOMContentLoaded'));
  // Flush the real detector's await and the popup's .then callback.
  await Promise.resolve();
  await Promise.resolve();
  expect(query).toHaveBeenCalledExactlyOnceWith({ active: true, currentWindow: true });
  expect(executeScript).not.toHaveBeenCalled();
  expect(logError).not.toHaveBeenCalled();
  expect(document.getElementById('assign-preview').value)
    .toBe('Use proper skill and gh identity, i.e., HsiehShuJeng, to proceed the task.');
  expect(document.getElementById('post-merge-preset').value).toBe('standard');
  expect(document.getElementById('post-merge-title-progress').checked).toBe(true);
});

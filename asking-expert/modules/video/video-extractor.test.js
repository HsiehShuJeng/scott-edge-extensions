import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { autoDetectVideoId } from './video-extractor.js';

describe('automatic DeepSRT video ID detection', () => {
  let query, executeScript, logError;
  beforeEach(() => {
    query = vi.fn();
    executeScript = vi.fn();
    vi.stubGlobal('chrome', { tabs: { query }, scripting: { executeScript } });
    logError = vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it.each([
    ['no active tab', []],
    ['URL unavailable', [{ id: 12 }]],
    ['uncommitted URL', [{ id: 12, url: '' }]],
    ['another website', [{ id: 12, url: 'https://example.com/' }]],
  ])('quietly skips %s', async (_description, tabs) => {
    query.mockResolvedValue(tabs);
    await expect(autoDetectVideoId()).resolves.toBeNull();
    expect(executeScript).not.toHaveBeenCalled();
    expect(logError).not.toHaveBeenCalled();
  });

  it('still extracts the video ID on a readable DeepSRT tab', async () => {
    query.mockResolvedValue([{ id: 12, url: 'https://challenges.deepsrt.com/challenge/example' }]);
    executeScript.mockResolvedValue([{ result: 'fixture-video' }]);
    await expect(autoDetectVideoId()).resolves.toBe('fixture-video');
    expect(executeScript).toHaveBeenCalledExactlyOnceWith({
      target: { tabId: 12 }, function: expect.any(Function),
    });
    expect(logError).not.toHaveBeenCalled();
  });

  it('returns null when the target page contains no video ID', async () => {
    query.mockResolvedValue([{ id: 12, url: 'https://challenges.deepsrt.com/challenge/example' }]);
    executeScript.mockResolvedValue([{ result: null }]);
    await expect(autoDetectVideoId()).resolves.toBeNull();
    expect(logError).not.toHaveBeenCalled();
  });

  it('preserves logging and null fallback for actual API failures', async () => {
    const error = new Error('Tab query failed');
    query.mockRejectedValue(error);
    await expect(autoDetectVideoId()).resolves.toBeNull();
    expect(logError).toHaveBeenCalledExactlyOnceWith('Error auto-detecting video ID:', error);
  });
});

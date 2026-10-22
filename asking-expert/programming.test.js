import { beforeAll, afterAll, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

vi.mock('./modules/core/index.js', () => ({ initializeUI: vi.fn(), showNotification: vi.fn() }));
vi.mock('./modules/video/index.js', () => ({
  handleExtractQuestions: vi.fn(), autoDetectVideoId: vi.fn().mockResolvedValue(null),
  handleVideoIdAction: vi.fn(), handleQuizGeneratorClick: vi.fn(),
}));
const writeText = vi.fn().mockResolvedValue(undefined);

describe('Programming Engineering bootstrap and existing tools', () => {
  beforeAll(async () => {
    document.body.innerHTML = readFileSync(path.join(__dirname, 'popup.html'), 'utf8');
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    vi.stubGlobal('chrome', {
      runtime: { onMessage: { addListener: vi.fn() } },
      storage: { local: { get: (_key, callback) => callback({ theme: 'light' }), set: vi.fn() } },
    });
    await import('./popup.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
  });
  afterAll(() => vi.unstubAllGlobals());

  it('initializes the new generator from the real popup bootstrap', () => {
    expect(document.getElementById('assign-identity').value).toBe('HsiehShuJeng');
    expect(document.getElementById('assign-preview').value).toBe('Use proper skill and gh identity, i.e., HsiehShuJeng, to proceed the task.');
    expect(document.getElementById('post-merge-agent').value).toBe('miko');
    expect(document.getElementById('post-merge-preset').value).toBe('standard');
  });

  it('keeps branch prompt generation and invalid-input focus behavior', () => {
    writeText.mockClear();
    const input = document.getElementById('branch-description');
    input.value = '  Add user authentication  ';
    document.getElementById('generate-branch-prompt').click();
    expect(writeText).toHaveBeenCalledExactlyOnceWith('Add user authentication\n\nBased on the above requirement(s), please suggest branch names for brainstorming and references. As development effort will be made based on the requirement.');
    input.value = '';
    document.getElementById('generate-branch-prompt').click();
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(input);
  });

  it('keeps PR command generation as copied text with shell escaping', () => {
    writeText.mockClear();
    const input = document.getElementById('pr-description');
    input.value = "feat(auth): validate user's email";
    document.getElementById('generate-pr-command').click();
    expect(writeText).toHaveBeenCalledTimes(1);
    const command = writeText.mock.calls[0][0];
    expect(command).toMatch(/^printf "#create_pull_request\\n%b/);
    expect(command).toContain("user'\\''s email");
    expect(command).toContain('$(git symbolic-ref --short HEAD)');
    expect(command).toMatch(/\| pbcopy$/);
    input.value = '';
    document.getElementById('generate-pr-command').click();
    expect(writeText).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['1', 'UNSTAGED', '$(git diff --word-diff)'],
    ['2', 'STAGED', '$(git diff --cached --word-diff)'],
    ['3', 'RANGE', '$(git diff main..HEAD --word-diff'],
  ])('keeps commit command %s', (key, type, diff) => {
    writeText.mockClear();
    document.querySelector(`.commit-btn[data-command="${key}"]`).click();
    expect(writeText).toHaveBeenCalledTimes(1);
    const prompt = writeText.mock.calls[0][0];
    expect(prompt).toContain('Generate a conventional commit message');
    expect(prompt).toContain(`ANALYZE THESE ${type} CHANGES:`);
    expect(prompt).toContain(diff);
    expect(prompt).toMatch(/\| pbcopy$/);
  });
});

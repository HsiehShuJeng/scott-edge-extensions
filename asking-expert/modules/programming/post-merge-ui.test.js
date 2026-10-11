import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { setupPostMergeGenerator } from './post-merge-ui.js';
import { formatPostMergePrompt, PRESETS } from './post-merge.js';

vi.mock('../core/index.js', () => ({ showNotification: vi.fn() }));
import { showNotification } from '../core/index.js';

const html = readFileSync(path.join(__dirname, '../../popup.html'), 'utf8');
const prUrl = 'https://github.com/HsiehShuJeng/content-summarizer/pull/63';
const el = name => document.getElementById(`post-merge-${name}`);
const change = (name, value) => {
  const field = el(name);
  if (field.type === 'checkbox') field.checked = value;
  else field.value = value;
  field.dispatchEvent(new Event('input', { bubbles: true }));
  field.dispatchEvent(new Event('change', { bubbles: true }));
};
const copy = () => el('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

describe('post-merge PE form', () => {
  let writeText;
  beforeEach(() => {
    document.body.innerHTML = html;
    writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    vi.clearAllMocks();
    setupPostMergeGenerator();
  });
  afterEach(() => vi.unstubAllGlobals());

  it('starts with Miko, mention on, standard cleanup and labeled controls inside PE', () => {
    expect(el('agent').value).toBe('miko');
    expect(el('mention').checked).toBe(true);
    expect(el('preset').value).toBe('standard');
    expect([...el('agent').options].map(option => option.text)).toEqual(['Astra', 'Jolene', 'Lilith', 'Miko', 'Nova', 'Scarlet']);
    expect(el('form').closest('#programming-tab')).toBeTruthy();
    for (const control of el('form').querySelectorAll('input, select, textarea')) {
      expect(document.querySelector(`label[for="${control.id}"]`)).toBeTruthy();
    }
    expect(el('preview').readOnly).toBe(true);
    expect(el('preview').value).toBe('');
    expect(showNotification).not.toHaveBeenCalled();
  });

  it('copies exactly the live preview and notifies only after clipboard fulfillment', async () => {
    let resolve;
    writeText.mockImplementation(() => new Promise(done => { resolve = done; }));
    change('url', `  ${prUrl}/?tab=files#discussion  `);
    const expected = formatPostMergePrompt({ agentKey: 'miko', includeMention: true, prUrl, tasks: PRESETS.standard.tasks }).text;
    expect(el('preview').value).toBe(expected);
    copy();
    expect(writeText).toHaveBeenCalledExactlyOnceWith(expected);
    expect(showNotification).not.toHaveBeenCalled();
    expect(el('copy').disabled).toBe(true);
    resolve();
    await vi.waitFor(() => expect(showNotification).toHaveBeenCalledWith('Post-merge prompt copied!', false, 'Programming Engineering'));
    expect(el('copy').disabled).toBe(false);
    expect(el('url').value).toContain('?tab=files');
  });

  it.each(['thread', 'skip-adapters', 'thorough', 'standard'])('applies %s without changing URL, agent or mention', preset => {
    change('url', prUrl);
    change('agent', 'jolene');
    change('mention', false);
    change('preset', preset);
    expect(el('url').value).toBe(prUrl);
    expect(el('agent').value).toBe('jolene');
    expect(el('mention').checked).toBe(false);
    expect(el('preview').value).toBe(formatPostMergePrompt({
      agentKey: 'jolene', includeMention: false, prUrl, tasks: PRESETS[preset].tasks,
    }).text);
  });

  it('marks edited task options as Custom and keeps both workflow and adapter instructions', () => {
    change('url', prUrl);
    change('workflow', 'check');
    change('adapters', 'skip');
    expect(el('preset').value).toBe('custom');
    expect(el('preview').value).toContain('The adapter-script exclusion takes precedence; report any resulting incomplete steps.');
    expect(el('preview').value).toContain("Check whether the repository's post-merge workflow");
  });

  it('resets every field and task to its initial default', () => {
    change('url', prUrl);
    change('agent', 'scarlet');
    change('mention', false);
    change('preset', 'thorough');
    el('reset').click();
    expect(el('url').value).toBe('');
    expect(el('agent').value).toBe('miko');
    expect(el('mention').checked).toBe(true);
    expect(el('preset').value).toBe('standard');
    expect(el('cleanup').checked).toBe(true);
    expect(el('title').checked).toBe(true);
    expect(el('review').checked).toBe(false);
    expect(el('workflow').value).toBe('default');
    expect(el('adapters').value).toBe('default');
    expect(el('preview').value).toBe('');
    expect(el('url-error').textContent).toBe('');
  });

  it.each(['', 'https://github.com/o/r/issues/1', 'https://user:pass@github.com/o/r/pull/1'])('clears stale preview and never copies invalid URL %s', value => {
    change('url', prUrl);
    change('url', value);
    expect(el('preview').value).toBe('');
    copy();
    expect(writeText).not.toHaveBeenCalled();
    expect(el('url-error').textContent).toContain('HTTPS GitHub PR URL');
    expect(el('url').getAttribute('aria-invalid')).toBe('true');
    expect(document.activeElement).toBe(el('url'));
  });

  it('blocks all tasks off and directs focus to the tasks', () => {
    change('url', prUrl);
    change('cleanup', false);
    change('title', false);
    copy();
    expect(writeText).not.toHaveBeenCalled();
    expect(el('tasks-error').textContent).toBe('Select at least one post-merge task.');
    expect(el('preview').value).toBe('');
    expect(document.activeElement).toBe(el('cleanup'));
  });

  it('allows a missing bot ID only after mention is turned off', () => {
    // Recreate form to avoid duplicate listeners; these IDs are test-only.
    document.body.innerHTML = html;
    setupPostMergeGenerator([{ key: 'miko', name: 'Miko', botId: '' }]);
    change('url', prUrl);
    copy();
    expect(writeText).not.toHaveBeenCalled();
    expect(el('agent-error').textContent).toContain('no valid Discord bot ID');
    expect(document.activeElement).toBe(el('agent'));
    change('mention', false);
    copy();
    expect(writeText).toHaveBeenCalledWith(expect.stringMatching(/^This PR has been merged:/));
  });

  it.each(['rejected', 'unavailable', 'no writeText'])('keeps preview and input for manual copy when clipboard is %s', async mode => {
    change('url', prUrl);
    const preview = el('preview').value;
    if (mode === 'rejected') writeText.mockRejectedValue(new Error('permission denied'));
    else vi.stubGlobal('navigator', { clipboard: mode === 'unavailable' ? undefined : {} });
    copy();
    await vi.waitFor(() => expect(showNotification).toHaveBeenCalled());
    expect(showNotification.mock.calls[0][1]).toBe(true);
    expect(el('clipboard-status').textContent).toContain('copy the preview manually');
    expect(el('preview').value).toBe(preview);
    expect(el('url').value).toBe(prUrl);
    expect(el('copy').disabled).toBe(false);
  });
});

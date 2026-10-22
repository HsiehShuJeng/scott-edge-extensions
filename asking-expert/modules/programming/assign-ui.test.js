import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { setupAssignGenerator } from './assign-ui.js';
import { IDENTITIES, DEFAULT_IDENTITY } from './identities.js';

vi.mock('../core/index.js', () => ({ showNotification: vi.fn() }));
import { showNotification } from '../core/index.js';

const html = readFileSync(path.join(__dirname, '../../popup.html'), 'utf8');
const el = name => document.getElementById(`assign-${name}`);
const selectIdentity = key => {
  el('identity').value = key;
  el('identity').dispatchEvent(new Event('change', { bubbles: true }));
};
const copy = () => el('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

describe('assign PE form', () => {
  let writeText;
  beforeEach(() => {
    document.body.innerHTML = html;
    writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    vi.clearAllMocks();
    setupAssignGenerator();
  });
  afterEach(() => vi.unstubAllGlobals());

  it('renders the registry with the default identity and labeled PE controls', () => {
    expect(el('form').closest('#programming-tab')).toBeTruthy();
    expect(el('identity').value).toBe(DEFAULT_IDENTITY);
    expect([...el('identity').options].map(option => [option.value, option.textContent]))
      .toEqual(IDENTITIES.map(({ key, login }) => [key, login]));
    expect(el('preview').value).toBe('Use proper skill and gh identity, i.e., HsiehShuJeng, to proceed the task.');
    expect(el('preview').readOnly).toBe(true);
    for (const control of el('form').querySelectorAll('select, textarea')) {
      expect(document.querySelector(`label[for="${control.id}"]`)).toBeTruthy();
    }
  });

  it('adds future registry entries without changing the UI', () => {
    document.body.innerHTML = html;
    setupAssignGenerator([...IDENTITIES, { key: 'future', login: 'future-reviewer' }]);
    selectIdentity('future');
    expect(el('identity').selectedOptions[0].textContent).toBe('future-reviewer');
    expect(el('preview').value).toBe('Use proper skill and gh identity, i.e., future-reviewer, to proceed the task.');
    copy();
    expect(writeText).toHaveBeenCalledExactlyOnceWith(el('preview').value);
  });

  it('copies the selected login and reports success only after fulfillment', async () => {
    let fulfill;
    writeText.mockImplementation(() => new Promise(resolve => { fulfill = resolve; }));
    selectIdentity('vixenclawsastraagent');
    copy();
    copy();
    expect(writeText).toHaveBeenCalledExactlyOnceWith('Use proper skill and gh identity, i.e., vixenclawsastraagent, to proceed the task.');
    expect(el('clipboard-status').textContent).toBe('');
    expect(showNotification).not.toHaveBeenCalled();
    expect(el('copy').disabled).toBe(true);
    fulfill();
    await vi.waitFor(() => expect(el('clipboard-status').textContent).toBe('Prompt copied.'));
    expect(el('copy').disabled).toBe(false);
  });

  it.each(['rejected', 'unavailable', 'no writeText'])('keeps preview for manual copy when clipboard is %s', async mode => {
    selectIdentity('vixenclawsastraagent');
    const preview = el('preview').value;
    if (mode === 'rejected') writeText.mockRejectedValue(new Error('permission denied'));
    else vi.stubGlobal('navigator', { clipboard: mode === 'unavailable' ? undefined : {} });
    copy();
    await vi.waitFor(() => expect(el('clipboard-status').textContent).toContain('copy the preview manually'));
    expect(el('preview').value).toBe(preview);
    expect(el('identity').value).toBe('vixenclawsastraagent');
    expect(showNotification.mock.calls[0][1]).toBe(true);
    expect(el('copy').disabled).toBe(false);
  });

  it.each(['identity', 'reset'].flatMap(edit => ['fulfill', 'reject'].map(outcome => [edit, outcome])))
  ('suppresses stale feedback after %s and delayed %s', async (edit, outcome) => {
    let fulfill, reject;
    writeText.mockImplementation(() => new Promise((resolve, fail) => { fulfill = resolve; reject = fail; }));
    selectIdentity('vixenclawsastraagent');
    copy();
    if (edit === 'reset') el('reset').click();
    else selectIdentity(DEFAULT_IDENTITY);
    if (outcome === 'fulfill') fulfill();
    else reject(new Error('late rejection'));
    await vi.waitFor(() => expect(el('copy').disabled).toBe(false));
    expect(el('clipboard-status').textContent).toBe('');
    expect(showNotification).not.toHaveBeenCalled();
    expect(el('identity').value).toBe(DEFAULT_IDENTITY);
  });

  it('blocks an unknown selection and focuses its error', () => {
    selectIdentity('missing');
    copy();
    expect(writeText).not.toHaveBeenCalled();
    expect(el('preview').value).toBe('');
    expect(el('identity-error').textContent).toContain('identity');
    expect(el('identity').getAttribute('aria-invalid')).toBe('true');
    expect(document.activeElement).toBe(el('identity'));
    el('reset').click();
    expect(el('identity').value).toBe(DEFAULT_IDENTITY);
    expect(el('identity-error').textContent).toBe('');
    expect(el('identity').getAttribute('aria-invalid')).toBe('false');
  });
});

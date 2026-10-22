import { showNotification } from '../core/index.js';
import { IDENTITIES, DEFAULT_IDENTITY } from './identities.js';
import { formatAssignPrompt } from './assign.js';

export function setupAssignGenerator(identities = IDENTITIES) {
  const form = document.getElementById('assign-form');
  if (!form) return;
  const el = name => form.querySelector(`#assign-${name}`);
  let copying = false;
  let revision = 0;
  const refresh = () => {
    const result = formatAssignPrompt({ identityKey: el('identity').value }, identities);
    el('preview').value = result.ok ? result.text : '';
    el('identity-error').textContent = result.ok ? '' : result.errors.identityKey;
    el('identity').setAttribute('aria-invalid', String(!result.ok));
    return result;
  };
  el('identity').replaceChildren(...identities.map(({ key, login }) => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = login;
    return option;
  }));
  const invalidate = () => {
    revision++;
    el('clipboard-status').textContent = '';
    refresh();
  };
  const reset = () => {
    el('identity').value = DEFAULT_IDENTITY;
    invalidate();
  };
  form.addEventListener('input', invalidate);
  form.addEventListener('change', invalidate);
  form.addEventListener('reset', event => {
    event.preventDefault();
    reset();
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (copying) return;
    const result = refresh();
    if (!result.ok) {
      el('identity').focus();
      return;
    }
    copying = true;
    el('copy').disabled = true;
    const copyRevision = revision;
    try {
      if (typeof navigator.clipboard?.writeText !== 'function') {
        throw new Error('Clipboard API is unavailable');
      }
      // Success follows fulfillment: https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText
      await navigator.clipboard.writeText(result.text);
      if (copyRevision !== revision) return;
      el('clipboard-status').textContent = 'Prompt copied.';
      showNotification('Assign prompt copied!', false, 'Programming Engineering');
    } catch (error) {
      if (copyRevision !== revision) return;
      const message = `Could not copy prompt (${error?.message || 'clipboard write failed'}); copy the preview manually.`;
      el('clipboard-status').textContent = message;
      showNotification(message, true);
    } finally {
      copying = false;
      el('copy').disabled = false;
    }
  });
  reset();
}

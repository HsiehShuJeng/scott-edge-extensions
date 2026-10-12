import { showNotification } from '../core/index.js';
import { AGENTS, DEFAULT_AGENT } from './agents.js';
import { DEFAULT_PRESET, PRESETS, formatPostMergePrompt } from './post-merge.js';

export function setupPostMergeGenerator(agents = AGENTS) {
  const form = document.getElementById('post-merge-form');
  if (!form) return;
  const el = name => form.querySelector(`#post-merge-${name}`);
  const controls = {
    agentKey: el('agent'), prUrl: el('url'), tasks: el('tasks'),
  };
  const errors = {
    agentKey: el('agent-error'), prUrl: el('url-error'), tasks: el('tasks-error'),
  };
  const taskControls = [el('cleanup'), el('workflow'), el('adapters'), el('review'), el('title')];
  let submitted = false;
  let copying = false;
  let revision = 0;
  const readTasks = () => ({
    cleanup: el('cleanup').checked,
    checkWorkflow: el('workflow').value === 'check',
    skipAdapters: el('adapters').value === 'skip',
    reviewUnchecked: el('review').checked,
    updateThreadTitle: el('title').checked,
  });
  const readInput = () => ({
    agentKey: el('agent').value, includeMention: el('mention').checked,
    prUrl: el('url').value, tasks: readTasks(),
  });
  const applyPreset = key => {
    const tasks = PRESETS[key].tasks;
    el('cleanup').checked = tasks.cleanup;
    el('workflow').value = tasks.checkWorkflow ? 'check' : 'default';
    el('adapters').value = tasks.skipAdapters ? 'skip' : 'default';
    el('review').checked = tasks.reviewUnchecked;
    el('title').checked = tasks.updateThreadTitle;
  };
  const refresh = () => {
    const result = formatPostMergePrompt(readInput(), agents);
    el('preview').value = result.ok ? result.text : '';
    const displayErrors = submitted || Boolean(el('url').value.trim());
    for (const key of Object.keys(errors)) {
      const message = displayErrors && !result.ok ? result.errors[key] || '' : '';
      errors[key].textContent = message;
      controls[key].setAttribute('aria-invalid', String(Boolean(message)));
    }
    return result;
  };
  el('agent').replaceChildren(...agents.map(agent => {
    const option = document.createElement('option');
    option.value = agent.key;
    option.textContent = agent.name;
    return option;
  }));
  el('preset').replaceChildren(...Object.entries(PRESETS).map(([key, preset]) => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = preset.label;
    return option;
  }));
  const custom = document.createElement('option');
  custom.value = 'custom';
  custom.textContent = 'Custom';
  custom.disabled = true;
  el('preset').append(custom);

  const invalidate = () => {
    revision++;
    el('clipboard-status').textContent = '';
    refresh();
  };
  const reset = () => {
    submitted = false;
    el('agent').value = DEFAULT_AGENT;
    el('mention').checked = true;
    el('url').value = '';
    el('preset').value = DEFAULT_PRESET;
    applyPreset(DEFAULT_PRESET);
    invalidate();
  };
  form.addEventListener('input', invalidate);
  form.addEventListener('change', event => {
    if (event.target === el('preset') && PRESETS[el('preset').value]) {
      applyPreset(el('preset').value);
    } else if (taskControls.includes(event.target)) {
      el('preset').value = 'custom';
    }
    invalidate();
  });
  form.addEventListener('reset', event => {
    event.preventDefault();
    reset();
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (copying) return;
    submitted = true;
    const result = refresh();
    if (!result.ok) {
      const key = ['prUrl', 'agentKey', 'tasks'].find(key => result.errors[key]);
      (key === 'tasks' ? el('cleanup') : controls[key]).focus();
      return;
    }
    copying = true;
    el('copy').disabled = true;
    const copyRevision = revision;
    try {
      if (typeof navigator.clipboard?.writeText !== 'function') {
        throw new Error('Clipboard API is unavailable');
      }
      // writeText resolves only after the clipboard is updated:
      // https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText
      await navigator.clipboard.writeText(result.text);
      if (copyRevision !== revision) return;
      el('clipboard-status').textContent = 'Prompt copied.';
      showNotification('Post-merge prompt copied!', false, 'Programming Engineering');
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

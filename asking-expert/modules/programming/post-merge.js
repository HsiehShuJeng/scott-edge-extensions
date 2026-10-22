import { AGENTS } from './agents.js';

export const DEFAULT_PRESET = 'standard';
const preset = (label, overrides) => Object.freeze({
  label,
  tasks: Object.freeze({
    cleanup: false, checkWorkflow: false, skipAdapters: false,
    reviewUnchecked: false, updateThreadTitle: true, ...overrides,
  }),
});

export const PRESETS = Object.freeze({
  thread: preset('Thread title only', {}),
  'skip-adapters': preset('Cleanup — skip adapter scripts', { cleanup: true, skipAdapters: true }),
  thorough: preset('Thorough post-merge review', { cleanup: true, checkWorkflow: true, reviewUnchecked: true, updateThreadTitle: false }),
  standard: preset('Standard cleanup', { cleanup: true }),
});

const TASK_TEXT = Object.freeze({
  cleanup: 'Perform the appropriate post-merge cleanup.',
  checkWorkflow: "Check whether the repository's post-merge workflow needs to be executed and follow its applicable requirements, including executing applicable adapter scripts.",
  skipAdapters: 'Do not execute scripts under the adapter directory (adapter/ or adapters/, as applicable).',
  reviewUnchecked: 'Review unchecked checklist items in the PR and linked issue descriptions and comments. Complete applicable outstanding work, and report anything still blocked; do not mark items complete without evidence.',
  updateThreadTitle: 'Update the title of the current Discord thread to reflect in-progress status (prefix with 🔄).',
});

// Match the raw path too: URL parsing alone silently normalizes dot segments,
// backslashes and embedded whitespace. PR numbers stay strings, like bot IDs.
function normalizePrUrl(value) {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  const match = /^https:\/\/github\.com\/([a-z\d][a-z\d-]*)\/([a-z\d_.-]+)\/pull\/([1-9]\d*)(?:\/(?:files|changes|checks|commits(?:\/[a-f\d]{7,40})?))?\/?(?:[?#][^\s]*)?$/i.exec(trimmed);
  if (!match || ['.', '..'].includes(match[2])) return null;
  return `https://github.com/${match[1]}/${match[2]}/pull/${match[3]}`;
}

/** Pure local formatter: returns { ok, text } or { ok, errors }, no side effects. */
export function formatPostMergePrompt({ agentKey, includeMention, prUrl, tasks = {}, threadTitleMode = 'in-progress' }, agents = AGENTS) {
  const errors = {};
  const normalizedUrl = normalizePrUrl(prUrl);
  if (!normalizedUrl) {
    errors.prUrl = 'Enter an HTTPS GitHub PR URL without credentials. Use the PR root or its /files, /changes, /checks, /commits or /commits/<sha> page; other trailing paths are unsupported.';
  }
  const agent = agents.find(candidate => candidate.key === agentKey);
  if (includeMention && !(typeof agent?.botId === 'string' && /^[1-9]\d{16,19}$/.test(agent.botId))) {
    errors.agentKey = 'This agent has no valid Discord bot ID. Choose another agent or turn off Include Discord mention.';
  }
  const actions = Object.entries(TASK_TEXT)
    .filter(([key]) => tasks[key] === true)
    .map(([key, sentence]) => {
      if (key === 'updateThreadTitle' && threadTitleMode === 'completed') {
        return 'Update the title of the current Discord thread to reflect the completed status (prefix with ✅).';
      }
      return key === 'skipAdapters' && tasks.checkWorkflow === true
        ? `${sentence} The adapter-script exclusion takes precedence; report any resulting incomplete steps.`
        : sentence;
    });
  if (!Object.keys(TASK_TEXT).some(key => key !== 'skipAdapters' && tasks[key] === true)) {
    errors.tasks = 'Select at least one post-merge action: cleanup, workflow check, checklist review or thread title.';
  }
  if (Object.keys(errors).length) return { ok: false, errors };
  const body = `This PR has been merged:\n${normalizedUrl}\n\n${actions.join('\n')}`;
  return { ok: true, text: includeMention ? `<@${agent.botId}>\n\n${body}` : body };
}

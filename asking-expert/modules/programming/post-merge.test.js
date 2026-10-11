import { describe, it, expect } from 'vitest';
import { AGENTS } from './agents.js';
import { formatPostMergePrompt, PRESETS, DEFAULT_PRESET } from './post-merge.js';

const central = 'https://github.com/HsiehShuJeng/agent-skills-central/pull/584';
const input = (overrides = {}) => ({
  agentKey: 'miko', includeMention: true, prUrl: central,
  tasks: { ...PRESETS[DEFAULT_PRESET].tasks }, ...overrides,
});

describe('post-merge prompt contract', () => {
  it('ships the six confirmed numeric-string bot mappings in selector order', () => {
    expect(AGENTS.map(({ key, botId }) => [key, botId])).toEqual([
      ['astra', '1491356445827010620'], ['jolene', '1525813280432722031'],
      ['lilith', '1491685434667831427'], ['miko', '1489873862668718240'],
      ['nova', '1491686849779863623'], ['scarlet', '1491378395253309510'],
    ]);
    for (const agent of AGENTS) {
      expect(formatPostMergePrompt(input({ agentKey: agent.key })).text)
        .toMatch(new RegExp(`^<@${agent.botId}>\n\nThis PR has been merged:`));
    }
  });

  it.each([
    ['thread', central.replace('584', '587'),
      'Update the title of the current Discord thread to reflect the actual completion status.'],
    ['skip-adapters', central,
      'Perform the appropriate post-merge cleanup.\nDo not execute scripts under the adapter directory (adapter/ or adapters/, as applicable).\nUpdate the title of the current Discord thread to reflect the actual completion status.'],
    ['thorough', central,
      "Perform the appropriate post-merge cleanup.\nCheck whether the repository's post-merge workflow needs to be executed and follow its applicable requirements.\nReview unchecked checklist items in the PR and linked issue descriptions and comments. Complete applicable outstanding work, and report anything still blocked; do not mark items complete without evidence.\nUpdate the title of the current Discord thread to reflect the actual completion status."],
    ['standard', 'https://github.com/HsiehShuJeng/content-summarizer/pull/63',
      'Perform the appropriate post-merge cleanup.\nUpdate the title of the current Discord thread to reflect the actual completion status.'],
  ])('matches the exact %s scenario with and without mention', (preset, prUrl, actions) => {
    for (const includeMention of [true, false]) {
      const result = formatPostMergePrompt(input({ prUrl, includeMention, tasks: PRESETS[preset].tasks }));
      expect(result).toEqual({
        ok: true, text: `${includeMention ? '<@1489873862668718240>\n\n' : ''}This PR has been merged:\n${prUrl}\n\n${actions}`,
      });
    }
  });

  it.each([central, `${central}/`, `  ${central}/?tab=files#discussion  `,
    'https://github.com/another-org/another.repo/pull/99999999999999999999',
  ])('accepts and normalizes a PR URL: %s', prUrl => {
    const result = formatPostMergePrompt(input({ prUrl }));
    expect(result.ok).toBe(true);
    expect(result.text).toContain(prUrl.trim().split(/[?#]/)[0].replace(/\/$/, ''));
    expect(result.text).not.toContain('?');
  });

  it.each(['', ' ', 'http://github.com/o/r/pull/1', 'https://github.com.evil.test/o/r/pull/1',
    'https://www.github.com/o/r/pull/1', 'https://github.com/o/r/issues/1',
    'https://github.com//r/pull/1', 'https://github.com/o//pull/1',
    'https://github.com/o/r/pull/0', 'https://github.com/o/r/pull/-1',
    'https://github.com/o/r/pull/1.2', 'https://github.com/o/r/pull/abc',
    'https://github.com/o/r/pull/01', 'https://github.com/o/r/pull/1/files',
    'https://user:pass@github.com/o/r/pull/1', 'https://github.com:444/o/r/pull/1',
    'https://github.com/o/r/pull/1\n2', 'https://github.com/o/../r/pull/1',
  ])('rejects malformed URLs: %s', prUrl => {
    expect(formatPostMergePrompt(input({ prUrl }))).toMatchObject({
      ok: false, errors: { prUrl: expect.any(String) },
    });
  });

  it.each([undefined, '', 'placeholder', '123', 1489873862668718240])('rejects invalid mention IDs: %s', botId => {
    const agents = [{ key: 'miko', name: 'Miko', botId }];
    expect(formatPostMergePrompt(input(), agents)).toMatchObject({ ok: false, errors: { agentKey: expect.any(String) } });
    expect(formatPostMergePrompt(input({ includeMention: false }), agents).ok).toBe(true);
  });

  it('preserves long fixture IDs without number conversion', () => {
    const botId = '12345678901234567890'; // test-only fixture
    expect(formatPostMergePrompt(input(), [{ key: 'miko', botId }]).text).toContain(`<@${botId}>`);
    expect(formatPostMergePrompt(input({ agentKey: 'missing' })).ok).toBe(false);
    expect(formatPostMergePrompt(input({ agentKey: 'missing', includeMention: false })).ok).toBe(true);
  });

  it('requires at least one action', () => {
    expect(formatPostMergePrompt(input({ tasks: {} }))).toMatchObject({ ok: false, errors: { tasks: expect.any(String) } });
  });

  it('composes all 32 combinations in order with adapter precedence', () => {
    const keys = ['cleanup', 'checkWorkflow', 'skipAdapters', 'reviewUnchecked', 'updateThreadTitle'];
    for (let mask = 1; mask < 32; mask++) {
      const tasks = Object.fromEntries(keys.map((key, index) => [key, Boolean(mask & (1 << index))]));
      const result = formatPostMergePrompt(input({ tasks }));
      expect(result.ok).toBe(true);
      const actions = result.text.split('\n\n')[2].split('\n');
      expect(actions).toHaveLength(keys.filter(key => tasks[key]).length);
      expect(new Set(actions).size).toBe(actions.length);
      expect(result.text.includes('The adapter-script exclusion takes precedence; report any resulting incomplete steps.'))
        .toBe(tasks.checkWorkflow && tasks.skipAdapters);
      expect(result.text).toBe(result.text.trim());
      expect(result.text).not.toMatch(/&lt;|```|\\n/);
    }
  });
});

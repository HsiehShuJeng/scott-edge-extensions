import { describe, it, expect } from 'vitest';
import { IDENTITIES, DEFAULT_IDENTITY } from './identities.js';
import { formatAssignPrompt } from './assign.js';

describe('assign prompt contract', () => {
  it('uses the exact default dispatch sentence', () => {
    expect(DEFAULT_IDENTITY).toBe('HsiehShuJeng');
    expect(formatAssignPrompt({ identityKey: DEFAULT_IDENTITY })).toEqual({
      ok: true, text: 'Use proper skill and gh identity, i.e., HsiehShuJeng, to proceed the task.',
    });
  });

  it('substitutes the agent login verbatim', () => {
    expect(formatAssignPrompt({ identityKey: 'vixenclawsastraagent' })).toEqual({
      ok: true, text: 'Use proper skill and gh identity, i.e., vixenclawsastraagent, to proceed the task.',
    });
  });

  it.each(['missing', '', undefined])('rejects unknown identity %s', identityKey => {
    expect(formatAssignPrompt({ identityKey })).toEqual({
      ok: false, errors: { identityKey: expect.any(String) },
    });
  });

  it('uses an injected registry without mutating it', () => {
    const identities = Object.freeze([Object.freeze({ key: 'reviewer', login: 'future-reviewer' })]);
    expect(formatAssignPrompt({ identityKey: 'reviewer' }, identities)).toEqual({
      ok: true, text: 'Use proper skill and gh identity, i.e., future-reviewer, to proceed the task.',
    });
    expect(Object.isFrozen(IDENTITIES)).toBe(true);
    expect(IDENTITIES.every(Object.isFrozen)).toBe(true);
  });
});

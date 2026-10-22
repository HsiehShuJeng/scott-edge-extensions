import { IDENTITIES } from './identities.js';

/** Pure local dispatch formatter; registry keys select public GitHub logins. */
export function formatAssignPrompt({ identityKey }, identities = IDENTITIES) {
  const identity = identities.find(candidate => candidate.key === identityKey);
  if (!identity) return { ok: false, errors: { identityKey: 'Choose a known GitHub identity.' } };
  return { ok: true, text: `Use proper skill and gh identity, i.e., ${identity.login}, to proceed the task.` };
}

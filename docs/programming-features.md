# Programming & Development Features

Scott's Assistant is also built to accelerate common developer workflows, focusing heavily on GitHub integrations and commit scaffolding.

## Agent Post-merge Prompt

Open **PE → Agent Post-merge Prompt**, paste a GitHub PR link, choose an agent and scenario, adjust the tasks, then select **Generate & Copy Prompt**. Paste the resulting English plain text into Discord yourself. The default is **Miko**, **Include Discord mention** enabled, and **Standard cleanup**. **Reset** restores those defaults and clears the URL.

The URL can belong to any GitHub repository. Leading/trailing whitespace, a trailing slash, query and fragment are removed from the generated PR root URL. Only HTTPS `github.com/owner/repo/pull/positive-integer` links without credentials are accepted. The module checks format locally; “This PR has been merged:” is the user's handoff statement, not a verified GitHub merge status.

| Scenario | Selected tasks |
| --- | --- |
| Thread title only | Update the Discord thread title |
| Cleanup — skip adapter scripts | Cleanup, exclude adapter scripts, update the title |
| Thorough post-merge review | Cleanup, check repository post-merge requirements, review unchecked PR/linked-issue description and comment items, update the title |
| Standard cleanup | Cleanup, update the title |

Scenarios change only task options: the PR URL, agent and mention preference stay intact. Editing any task marks the scenario **Custom**. Workflow and adapter **Default / no extra instruction** add no execution command. Selecting a workflow check together with an adapter exclusion explicitly gives the exclusion precedence and asks the agent to report incomplete steps. At least one action is required: cleanup, workflow check, checklist review or thread-title update. An adapter restriction alone does not give the agent any work and cannot be copied.

The selectable preview updates immediately and clears when input becomes invalid. Copying writes exactly the valid preview, with real newlines and an optional literal `<@bot_id>` first line. Success is shown only after the Clipboard API write fulfills. If the API is unavailable or rejects the write, the input and preview remain available for manual copying. Validation errors identify the field/task and submission focuses the correction point.

For example, **Standard cleanup** with mention disabled and a content-summarizer PR produces:

```text
This PR has been merged:
https://github.com/HsiehShuJeng/content-summarizer/pull/63

Perform the appropriate post-merge cleanup.
Update the title of the current Discord thread to reflect the actual completion status.
```

This feature generates local text. It makes no OpenAI, GitHub or Discord request, executes no commands, sends no messages, and performs no actual cleanup. It requires no new credentials or extension permissions. Popup drafts are not persisted.

### Agent identifiers

The runtime source of truth is [modules/programming/agents.js](../asking-expert/modules/programming/agents.js), ordered Astra, Jolene, Lilith, Miko, Nova, Scarlet. All bot IDs stay numeric strings, including when constructing a mention. Tests may inject invalid/missing or long fixture IDs; those fixtures are not runtime mappings. A missing/invalid ID blocks copying with mention enabled; disabling mention allows text generation.

Provenance from [issue #29](https://github.com/HsiehShuJeng/scott-edge-extensions/issues/29), recorded on 2026-10-11:

- Astra, Lilith, Nova and Scarlet: [OpenAB identity mapping](https://github.com/HsiehShuJeng/agent-skills-central/blob/main/openab-scott/protocols/adversarial-discussion.md), which records bot `/users/@me` verification on 2026-07-05. This is historical evidence, not a fresh API verification.
- Miko: the bot mention user object and reply author in the [source Discord message](https://discord.com/channels/1489873082201018419/1489873082201018422/1558852045992362107), recorded in the issue as the same ID with `bot: true`.
- Jolene: [Scott's supplied client ID](https://discord.com/channels/1489873082201018419/1489873082201018422/1558853966756839556); no claim of fresh Discord API verification. The issue records that guild member lookup was denied by an allowlist and was not bypassed.

### Implementation and verification

Runtime files are `popup.html`, `popup.js`, `styles/popup-post-merge.css`, and `modules/programming/{agents,post-merge,post-merge-ui}.js`. Documentation and `*.test.js` are reference/test-only. Presets are ordinary task data consumed by a pure formatter rather than separate duplicated templates; this keeps customized combinations deterministic while matching the existing native ES-module UI. No new dependency or architecture migration is introduced.

`formatPostMergePrompt({ agentKey, includeMention, prUrl, tasks })` returns `{ ok: true, text }` or `{ ok: false, errors }`. Validation keys are `prUrl`, `agentKey` and `tasks`. Task keys and golden outputs are maintained in [formatter tests](../asking-expert/modules/programming/post-merge.test.js); clipboard, reset and preset/custom transitions are covered by [UI tests](../asking-expert/modules/programming/post-merge-ui.test.js). The real popup bootstrap and existing commit/branch/PR tools have [regression tests](../asking-expert/programming.test.js).

The implementation plan used three independent slices: pure formatting and agent registry; PE controls and interaction/regression tests; documentation and verification evidence. Each implementation slice was verified before its atomic commit. Run `npm test` and `npm run lint`. On npm versions resolving new unlocked peer dependencies, the existing lockfile needs `npm ci --legacy-peer-deps`; this feature does not change dependency manifests.

Clipboard handling follows [the writeText promise contract](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText). Test mocking follows [Vitest's utility API](https://vitest.dev/api/vi.html#vi-stubglobal). Browser verification and its remaining manual checks are recorded in [post-merge verification](post-merge-verification.md).

## Developer Workflows

### AI Commit Statement Generator
Say goodbye to poorly thought-out `git commit -m "fix stuff"` messages. The extension integrates deeply with your current working repository context.

- **Diff Analysis**: Uses the `git diff` output of your staged files (or selected files) to comprehensively understand *what* has changed.
- **Contextual Understanding**: Feeds the diff into an LLM with strict formatting prompts (based on Conventional Commits, e.g., `feat:`, `fix:`, `chore:`).
- **Quality Scaffolding**: Automatically generates a structured commit message with a clear title and a descriptive body outlining the "Why" and "How" of the changes.

### Automated Pull Request Drafting
Creating insightful PR summaries takes time. The extension automates this template generation.

- **Branch Comparison**: Analyzes the differences between your feature branch and the target `main`/`develop` branch.
- **Jira/Ticket Linking**: Can be configured to find ticket numbers (e.g., `PROJ-1234`) in branch names and append them to the PR description.
- **Structured Sections**: Automatically generates `## Description`, `## What Changed`, and `## Testing Instructions` based on the code semantics in the diff.

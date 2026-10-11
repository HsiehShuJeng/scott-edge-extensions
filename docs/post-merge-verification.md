# Agent Post-merge Prompt Verification

Verification date: 2026-10-11. Feature scope and identifier provenance are in [programming-features.md](programming-features.md#agent-post-merge-prompt); acceptance requirements are in [#29](https://github.com/HsiehShuJeng/scott-edge-extensions/issues/29).

## Automated checks

- `npm test`: 71 tests across 6 files pass, including all six mappings, exact outputs for four scenarios, all task combinations, URL rejection/normalization, preview/clipboard equality, preset/custom transitions, reset, missing IDs, clipboard rejection/absence and existing PE tools.
- `npm run lint`: JavaScript syntax, CSS and HTML checks pass. Existing jsdom tests emit localhost CSS-resource warnings, and Browserslist reports old compatibility data; neither fails the checks.
- Dependencies installed using `npm ci --legacy-peer-deps` because the existing lockfile lacks newly resolved TypeScript peer entries under the host's npm. No dependency or manifest changes were made.

## Edge extension-page checks

Used the installed **Microsoft Edge 155.0.4283.45**, extension **3.2.9**, through Puppeteer **24.37.5** with an isolated temporary browser profile. The unpacked extension was installed through browser debugging and its actual `chrome-extension://…/popup.html` was opened in a headless page at **350 × 600**. No Chrome API mocks were used for initialization or successful copying.

- PE placement, actual popup bootstrap, six-agent order and default Miko pass.
- Tab moves from URL to agent to mention; Space toggles mention; Enter in the URL submits and produces the success notification.
- The four golden-output scenarios pass against the rendered form.
- Real Clipboard API write and read-back match the preview exactly, including the literal mention and newlines. Clipboard read permission was granted only to the temporary test profile for evidence collection; the shipped manifest is unchanged.
- Light/dark screenshots were inspected. At 350px, `scrollWidth === clientWidth === 350`; preview colors are `#333` on `#fff` in light mode and `#f0f0f0` on `#333` in dark mode. Dropdown arrows use a single non-repeating 10px image in both themes. A shared background-shorthand reset initially tiled the dark arrow; the fix is scoped to this module.
- Simulated `NotAllowedError` rejection and simulated Clipboard API absence show failure and preserve the preview. These exercise error handling; they are not claims of naturally occurring Edge permission denial.
- No HTTP(S) requests or uncaught popup errors were observed during the scenario flows. Runtime source inspection also confirms no OpenAI/GitHub/Discord client, command execution or auto-send in the new module.

The PR evidence draft release `pr-evidence-29-agent-post-merge` contains `edge-light.png`, `edge-dark.png`, `edge-report.json`, `clipboard-text.txt` and the standalone `edge-check.cjs` reproduction script. The script uses the repository's existing Puppeteer dependency; run it from the repository root on a machine with Edge installed. It uses a task-specific evidence output directory and should be adapted for another host. The PR links the uploaded artifacts.

## Remaining manual acceptance

**Not verified:** opening the extension from Edge's native toolbar popup and pasting into an external editor or Discord. Automated Meta+V produced no pasted text, and browser `execCommand('paste')` returned false, although the real Clipboard API read-back matched the generated preview. These automation results do not establish a failed user paste or a successful Discord paste.

Before marking #29's manual criterion complete:

1. Load `asking-expert/` unpacked in Edge and record the installed version.
2. Open the toolbar popup, enter PE and check six agents plus all four presets with keyboard navigation, custom tasks and Reset.
3. Copy and paste into an editor or Discord's composer without sending. Compare the full plain text with the preview, including mention on/off, newlines and normalized URL.
4. Check light/dark readability and popup scrolling without horizontal overflow. Record success feedback and a reproducible clipboard-failure path when available; distinguish simulated failures from real browser failures.

No feature release or deployment is claimed by these checks.

# Agent Post-merge Prompt Verification

Feature scope and identifier provenance are in [programming-features.md](programming-features.md#agent-post-merge-prompt); acceptance requirements are in [#29](https://github.com/HsiehShuJeng/scott-edge-extensions/issues/29). Original verification below is dated 2026-10-11; the maintainer follow-up is dated 2026-10-12.

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
- URL and all-tasks-off error text use a scoped dark red in light mode (6.50:1 against white), preserving the shared dark-theme error color. This addresses a contrast issue found in the independent review; rendered error paths were checked in both themes.
- Simulated `NotAllowedError` rejection and simulated Clipboard API absence show failure and preserve the preview. These exercise error handling; they are not claims of naturally occurring Edge permission denial.
- No HTTP(S) requests or uncaught popup errors were observed during the scenario flows. Runtime source inspection also confirms no OpenAI/GitHub/Discord client, command execution or auto-send in the new module.

The original local screenshots, report, clipboard sample and host-specific script were not uploaded: automatic approval review rejected external attachment upload pending explicit authorization. This does not invalidate those historical checks, but remote reviewers cannot inspect those screenshots. The reproducible source tool added below replaces the instruction to run a script unavailable in the repository.

## Maintainer follow-up (2026-10-12)

All five [maintainer suggestions](https://github.com/HsiehShuJeng/scott-edge-extensions/pull/30#issuecomment-6110808589) were adopted after source verification. The formatter now requires an actual action and normalizes supported PR subpages; the UI suppresses obsolete clipboard completion/rejection feedback after any field edit or Reset. Release notes use the existing conventional-commit generator instead of a hand-written `Unreleased` header.

- `npm test`: 95 tests across 6 files pass. New cases cover adapter-only rejection, `/files`/`commits`/`checks` normalization with query/fragment/trailing slash, and 14 delayed clipboard fulfill/reject combinations, including editing then restoring the same preview.
- `npm run lint` passes; `node --check scripts/check-post-merge-edge.cjs` passes.
- [scripts/check-post-merge-edge.cjs](../scripts/check-post-merge-edge.cjs) is a portable source verifier using the existing Puppeteer dependency and an isolated temporary Edge profile. It exercises the actual extension page, agent defaults, four exact scenarios, URL normalization, Tab/Space/Enter, real Clipboard API read-back, delayed clipboard fulfillment/rejection after Reset, adapter-only rejection, theme layout and request/error observation.

Run from the repository root after installing dependencies:

```sh
node scripts/check-post-merge-edge.cjs --out /tmp/pe-post-merge-evidence
```

Use `--edge /path/to/msedge` if Edge is not in a detected installation location. With no `--out`, the tool creates a temporary local output directory. Output must be outside the repository; generated PNGs and JSON are local evidence, not source files to commit. The script loads an unpacked extension and writes format-only fixture text to the clipboard. It grants read permission only in its temporary test profile to compare the write with the preview. Loading uses [Puppeteer's extension API](https://pptr.dev/guides/chrome-extensions#at-runtime); the installed 24.37.5 API was checked before use.

The new verifier passed on macOS with Edge 155.0.4283.45 and extension 3.2.9: 350px light/dark layouts have no horizontal overflow, clipboard read-back equals the preview, both simulated late completion paths preserve Reset, adapter-only copying is blocked, and no HTTP(S) requests or uncaught page errors were observed. Other operating systems and the native toolbar popup are not claimed verified. The screenshots/report remain local.

## Remaining manual acceptance

**Not verified:** opening the extension from Edge's native toolbar popup and pasting into an external editor or Discord. Automated Meta+V produced no pasted text, and browser `execCommand('paste')` returned false, although the real Clipboard API read-back matched the generated preview. These automation results do not establish a failed user paste or a successful Discord paste.

Before marking #29's manual criterion complete:

1. Load `asking-expert/` unpacked in Edge and record the installed version.
2. Open the toolbar popup, enter PE and check six agents plus all four presets with keyboard navigation, custom tasks and Reset.
3. Copy and paste into an editor or Discord's composer without sending. Compare the full plain text with the preview, including mention on/off, newlines and normalized URL.
4. Check light/dark readability and popup scrolling without horizontal overflow. Record success feedback and a reproducible clipboard-failure path when available; distinguish simulated failures from real browser failures.

No feature release or deployment is claimed by these checks.

# Programming Agent Prompt Verification

Feature scope and identifier provenance are in [programming-features.md](programming-features.md#agent-post-merge-prompt); acceptance requirements are in [#29](https://github.com/HsiehShuJeng/scott-edge-extensions/issues/29). Original verification below is dated 2026-10-11; the maintainer follow-up is dated 2026-10-12.

## Current marker default: green check (2026-10-22)

The user clarified the intended default: **✅ green check** is used in almost all post-merge title updates; **🔄 in progress** is an explicit choice for the few cases still in progress. Issue #31, the PR description and active feature documentation are synchronized with this clarification. The initial #31 evidence below records the earlier interpretation and is superseded for marker defaults.

- `npm test`: **144 tests across 10 files pass**. Updated golden/UI/bootstrap cases cover ✅ in the initial state, omitted or unrecognized formatter modes, presets, Reset and re-enabling. Only explicit `in-progress` selection produces 🔄; Thorough still has no thread-title instruction.
- `npm run lint` and `node --check scripts/check-post-merge-edge.cjs` pass, with the existing Browserslist notice unchanged.
- The Edge source verifier passes **10 checks**, including real clipboard equality for default ✅ and selected 🔄, native arrow-key navigation, radio disabling, restoring ✅ on presets/re-enable, and 350px saved light/dark layouts. No HTTP(S) requests, uncaught errors or `console.error` messages were observed.
- The new light/dark marker screenshots were visually inspected: ✅ is selected in the first segment and 🔄 remains available in the second. Browser/runtime versions remain Edge 155.0.4283.62, Puppeteer 24.37.5 and extension 3.3.0. New evidence is labeled `greencheck-*` so earlier captures remain identifiable.

Native toolbar popup, live theme-toggle repaint and external paste are not claimed verified for this correction.

## Assign and title-mode follow-up (2026-10-22, #31)

The earlier entries below describe historical verification for #29. Initial #31 validation covered Assign to Agent, the revised Thorough scenario and explicit thread-title markers:

- `npm test`: **136 tests across 8 files pass**. New cases cover exact assignment text for both shipped logins, unknown keys, an appended registry entry, clipboard absence/rejection/stale results, Thorough without a title line, marker defaults/fallbacks, explicit ✅, disabled radio controls, and 🔄 after presets, Reset and re-enabling.
- `npm run lint` and `node --check scripts/check-post-merge-edge.cjs` pass. Existing localhost CSS-resource messages and the stale Browserslist database notice remain; no new lint warnings were introduced.
- The source verifier passed **10 checks** on macOS with **Edge 155.0.4283.62**, **Puppeteer 24.37.5** and extension **3.3.0**, using an isolated headless profile and the actual extension page at 350 × 600.
- Assignment selection and Reset work, and real Clipboard API read-back equals the selected login's sentence. ArrowRight selects the native ✅ radio and produces exactly the completed instruction; a real copy matches that preview. Re-enabling the title task and applying each preset restore 🔄; Thorough disables the radios and includes adapter execution without a title line.
- Both themes have 350px client/scroll widths, a single dropdown arrow, two marker segments on the same row, and the inherited 2px keyboard focus outline. The light/dark assignment and marker screenshots and full dark PE layout were visually inspected: text, selected states and previews remain readable.
- No observed HTTP(S) requests or uncaught page errors. Automated clicks wait for the existing transient success toasts to disappear so the overlay cannot intercept the next action.

The report and six PNGs are generated outside the repository with the command below. They are verification artifacts, not runtime assets. **Not verified:** the native toolbar popup, live theme-toggle repaint and external editor/Discord paste. These are not implied by headless clipboard read-back. This change does not execute post-merge cleanup or adapter scripts; it generates instructions only.

### URL-less active-tab follow-up (2026-10-22)

A user reported `Cannot read properties of undefined (reading 'includes')` from `autoDetectVideoId`. The returned tab existed but its optional `url` was absent. The existing catch logged the error and returned `null`; because popup startup does not await this detection, that error did not prevent either PE generator from initializing and does not explain missing new HTML controls.

The detector now quietly skips tabs without a string URL. Two new tests first reproduced the exact logged TypeError, then passed with the guard: a focused detector regression and a real popup/video-module integration regression. Other cases retain successful DeepSRT extraction and logging for actual API failures. `npm test` now passes **144 tests across 10 files**; lint and source-verifier syntax checks pass. The Edge verifier's **10 checks** pass with additional monitoring for `console.error` messages, as well as uncaught page errors and HTTP(S) requests. No console errors were observed. No permission, dependency or layout change was introduced.

The browser's actual unpacked source path still needs to be checked separately if Assign to Agent or the title-mode radios are absent. Both controls exist in this branch's static `popup.html`; the supplied legacy form did not contain the new radio fieldset.

## Automated checks (original #29)

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

## Non-blocking review follow-up (2026-10-12)

Both suggestions in the [earlier review](https://github.com/HsiehShuJeng/scott-edge-extensions/pull/30#issuecomment-6114830243) were adopted after checking the current source:

- `/changes` and `/commits/<sha>` now normalize to the PR root, including trailing slash, query and fragment. Commit SHA segments must contain 7–40 hexadecimal characters; malformed SHA segments and extra path segments remain rejected. Regression tests reproduce the formerly rejected URLs before the fix.
- The Edge verifier saves each theme through the actual extension storage API and reloads the popup before capturing it, instead of switching the theme on an already rendered textarea. It verifies both foreground and background colors, waits for the existing popup notice to disappear, and waits for finite animations, fonts and two animation frames. Infinite marquee animations are excluded; canceled transitions may settle without aborting verification.
- `npm test`: 104 tests across 6 files pass. `npm run lint` and `node --check scripts/check-post-merge-edge.cjs` pass.
- The final verifier passed three consecutive runs in isolated profiles on macOS with Edge 155.0.4283.45, Puppeteer 24.37.5 and extension 3.2.9. Each run passed all 8 checks. All three dark screenshots were inspected: the preview has a dark background and readable light text. The three dark PNGs are identical, as are the three light PNGs. Evidence remains local; it is not uploaded or included in the source commit.

Simplification review covered the changed formatter, tests, source verifier and documentation. The existing URL validation and parameterized tests were retained; no additional abstraction or unrelated cleanup was warranted. The pre-existing lockfile mismatch is outside these two fixes. The version remains 3.2.9; the release workflow performs the version bump after merge. Manual toolbar popup and external paste acceptance still require the checks below.

The [subsequent review](https://github.com/HsiehShuJeng/scott-edge-extensions/pull/30#issuecomment-6114976334) rechecked head `dfbeb79` and reported matching test and screenshot results. The reviewer also reported a separate real `#theme-toggle` interaction probe in headless and headful Edge, with 12 readable dark-preview captures. That probe is review evidence, not coverage provided by the repository verifier: the verifier captures saved themes after reload and does not exercise the live toggle. Its old screenshot timing issue does not establish a product repaint defect. The review's two wording suggestions were adopted: remove the machine-specific temporary evidence path and clarify the script comment's scope.

## Remaining manual acceptance

**Not verified:** opening the extension from Edge's native toolbar popup and pasting into an external editor or Discord. Automated Meta+V produced no pasted text, and browser `execCommand('paste')` returned false, although the real Clipboard API read-back matched the generated preview. These automation results do not establish a failed user paste or a successful Discord paste.

Before marking #29's manual criterion complete:

1. Load `asking-expert/` unpacked in Edge and record the installed version.
2. Open the toolbar popup, enter PE and check six agents plus all four presets with keyboard navigation, custom tasks and Reset.
3. Copy and paste into an editor or Discord's composer without sending. Compare the full plain text with the preview, including mention on/off, newlines and normalized URL.
4. Check light/dark readability and popup scrolling without horizontal overflow. Record success feedback and a reproducible clipboard-failure path when available; distinguish simulated failures from real browser failures.

No feature release or deployment is claimed by these checks.

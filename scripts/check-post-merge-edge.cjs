// Local extension-page checks, not manual toolbar/Discord acceptance.
// Extension loading API: https://pptr.dev/guides/chrome-extensions#at-runtime
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { parseArgs } = require('node:util');
const puppeteer = require('puppeteer');

const { values } = parseArgs({ options: {
  edge: { type: 'string' }, out: { type: 'string' }, help: { type: 'boolean' },
} });
if (values.help) {
  console.log('node scripts/check-post-merge-edge.cjs [--edge /path/to/Edge] [--out /path/to/local/evidence]');
  process.exit(0);
}
const repoRoot = path.resolve(__dirname, '..');
const candidates = {
  darwin: ['/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'],
  linux: ['/usr/bin/microsoft-edge', '/usr/bin/microsoft-edge-stable'],
  win32: ['PROGRAMFILES', 'PROGRAMFILES(X86)', 'LOCALAPPDATA'].filter(key => process.env[key])
    .map(key => path.join(process.env[key], 'Microsoft', 'Edge', 'Application', 'msedge.exe')),
};

async function main() {
  const executablePath = values.edge || (candidates[process.platform] || []).find(file => fs.existsSync(file));
  assert.ok(executablePath && fs.existsSync(executablePath), 'Install Edge or supply --edge with its executable path.');
  const output = values.out ? path.resolve(values.out) : fs.mkdtempSync(path.join(os.tmpdir(), 'pe-edge-'));
  assert.ok(output !== repoRoot && !output.startsWith(`${repoRoot}${path.sep}`), 'Use an output directory outside the repository.');
  fs.mkdirSync(output, { recursive: true });
  const report = {
    method: 'Automated headless Edge extension-page checks in an isolated temporary profile',
    checks: [],
    manualAcceptance: 'Not verified: native toolbar popup and external editor/Discord paste',
  };
  const browser = await puppeteer.launch({
    executablePath, headless: true, pipe: true, enableExtensions: true,
    defaultViewport: { width: 350, height: 600 },
  });
  try {
    report.browser = await browser.version();
    assert.match(report.browser, /^Edg\//, 'The verification browser must be Microsoft Edge.');
    report.puppeteer = require('puppeteer/package.json').version;
    const id = await browser.installExtension(path.join(repoRoot, 'asking-expert'));
    const page = await browser.newPage();
    page.setDefaultTimeout(5000);
    const outbound = [], pageErrors = [];
    page.on('request', request => { if (/^https?:/.test(request.url())) outbound.push(request.url()); });
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.goto(`chrome-extension://${id}/popup.html`);
    await page.waitForSelector('#post-merge-agent option');
    await page.click('[data-tab="programming"]');
    await page.waitForSelector('#programming-tab.active');
    report.extensionVersion = await page.evaluate(() => chrome.runtime.getManifest().version);
    assert.deepEqual(await page.$eval('#post-merge-agent', el => [...el.options].map(option => option.text)),
      ['Astra', 'Jolene', 'Lilith', 'Miko', 'Nova', 'Scarlet']);
    assert.equal(await page.$eval('#post-merge-agent', el => el.value), 'miko');
    report.checks.push('Actual popup bootstrap, PE placement, six agents and default Miko');

    const setUrl = value => page.$eval('#post-merge-url', (el, text) => {
      el.value = text; el.dispatchEvent(new Event('input', { bubbles: true }));
    }, value);
    const preview = () => page.$eval('#post-merge-preview', el => el.value);
    const url = 'https://github.com/example/repository/pull/123'; // Format-only fixture, never requested.
    await setUrl(url);
    await page.focus('#post-merge-url');
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'post-merge-agent');
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'post-merge-mention');
    await page.keyboard.press('Space');
    assert.equal(await page.$eval('#post-merge-mention', el => el.checked), false);
    await page.keyboard.press('Space');
    report.checks.push('Native Tab/Space keyboard flow');

    const cleanup = 'Perform the appropriate post-merge cleanup.';
    const title = 'Update the title of the current Discord thread to reflect in-progress status (prefix with 🔄).';
    const scenarios = {
      thread: [title],
      'skip-adapters': [cleanup, 'Do not execute scripts under the adapter directory (adapter/ or adapters/, as applicable).', title],
      thorough: [cleanup, "Check whether the repository's post-merge workflow needs to be executed and follow its applicable requirements, including executing applicable adapter scripts.",
        'Review unchecked checklist items in the PR and linked issue descriptions and comments. Complete applicable outstanding work, and report anything still blocked; do not mark items complete without evidence.'],
      standard: [cleanup, title],
    };
    for (const [preset, actions] of Object.entries(scenarios)) {
      await page.select('#post-merge-preset', preset);
      assert.equal(await preview(), `<@1489873862668718240>\n\nThis PR has been merged:\n${url}\n\n${actions.join('\n')}`);
    }
    const expected = await preview();
    for (const tab of ['files', 'changes', 'commits', 'commits/070d9ba', 'checks']) {
      await setUrl(`${url}/${tab}/?view=1#discussion`);
      assert.equal(await preview(), expected);
    }
    report.checks.push('Four exact scenario outputs and common PR subpage normalization');

    await page.focus('#post-merge-url');
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => document.getElementById('post-merge-clipboard-status').textContent === 'Prompt copied.');
    // This grant is for verification only; the shipped extension permissions stay unchanged.
    await browser.defaultBrowserContext().overridePermissions(`chrome-extension://${id}`, ['clipboard-read', 'clipboard-write']);
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), expected);
    report.checks.push('Enter submits; actual Clipboard API read-back exactly equals preview');

    const themes = [];
    for (const dark of [false, true]) {
      // Reload each saved theme to avoid the old script's screenshot timing issue.
      // This loop covers saved-theme loading; live #theme-toggle checks require
      // a separate interaction flow.
      await page.evaluate(value => chrome.storage.local.set({ theme: value ? 'dark' : 'light' }), dark);
      await page.reload();
      await page.waitForSelector('#post-merge-agent option');
      await page.click('[data-tab="programming"]');
      await setUrl(url);
      assert.equal(await preview(), expected);
      await page.waitForFunction(value => {
        const style = getComputedStyle(document.getElementById('post-merge-preview'));
        return document.body.classList.contains('dark-theme') === value &&
          style.backgroundColor === (value ? 'rgb(51, 51, 51)' : 'rgb(255, 255, 255)') &&
          style.color === (value ? 'rgb(240, 240, 240)' : 'rgb(51, 51, 51)');
      }, {}, dark);
      // The popup's existing internal-page notice must not cover the evidence.
      await page.waitForFunction(() => ![...document.body.children].some(el => el.style.position === 'fixed' && el.style.zIndex === '10000'));
      await page.evaluate(async () => {
        // A replaced CSS transition rejects its finished promise when canceled.
        await Promise.allSettled(document.getAnimations()
          .filter(animation => Number.isFinite(animation.effect.getComputedTiming().endTime))
          .map(animation => animation.finished));
        await document.fonts.ready;
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      });
      const metrics = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth,
        dropdownRepeat: getComputedStyle(document.getElementById('post-merge-agent')).backgroundRepeat,
        dropdownSize: getComputedStyle(document.getElementById('post-merge-agent')).backgroundSize,
      }));
      assert.equal(metrics.scrollWidth, metrics.clientWidth);
      assert.equal(metrics.dropdownRepeat, 'no-repeat');
      assert.equal(metrics.dropdownSize, '10px 10px');
      themes.push({ dark, loadedFromSavedTheme: true, ...metrics });
      await page.screenshot({ path: path.join(output, dark ? 'edge-dark.png' : 'edge-light.png'), fullPage: true });
    }
    report.themes = themes;
    report.checks.push('350px light/dark themes, no horizontal overflow, single dropdown arrows');

    for (const outcome of ['fulfill', 'reject']) {
      await page.evaluate(() => {
        window.copyCalls = 0;
        Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
          writeText: () => {
            window.copyCalls++;
            return new Promise((resolve, reject) => { window.finishCopy = { resolve, reject }; });
          },
        } });
        document.getElementById('post-merge-form').requestSubmit();
      });
      await page.$eval('#post-merge-reset', el => el.click());
      await page.evaluate(result => {
        if (result === 'fulfill') window.finishCopy.resolve();
        else window.finishCopy.reject(new Error('Simulated delayed rejection'));
      }, outcome);
      await page.waitForFunction(() => !document.getElementById('post-merge-copy').disabled);
      assert.equal(await page.$eval('#post-merge-clipboard-status', el => el.textContent), '');
      assert.equal(await preview(), '');
      await setUrl(url);
    }
    report.checks.push('Simulated delayed clipboard fulfill/reject after Reset has no stale feedback');

    const copyCalls = await page.evaluate(() => window.copyCalls);
    await page.evaluate(() => {
      for (const name of ['cleanup', 'title']) document.getElementById(`post-merge-${name}`).checked = false;
      const adapters = document.getElementById('post-merge-adapters');
      adapters.value = 'skip'; adapters.dispatchEvent(new Event('change', { bubbles: true }));
      document.getElementById('post-merge-form').requestSubmit();
    });
    assert.equal(await preview(), '');
    assert.match(await page.$eval('#post-merge-tasks-error', el => el.textContent), /at least one post-merge action/);
    assert.equal(await page.evaluate(() => window.copyCalls), copyCalls);
    report.checks.push('Adapter restriction alone is rejected without copying');
    assert.deepEqual(outbound, []);
    assert.deepEqual(pageErrors, []);
    report.checks.push('No observed HTTP(S) requests or uncaught popup errors');
    report.verifiedAt = new Date().toISOString();
    report.status = 'passed';
    fs.writeFileSync(path.join(output, 'edge-report.json'), `${JSON.stringify(report, null, 2)}\n`);
    console.log(`Edge checks passed. Local evidence: ${output}`);
  } finally {
    await browser.close();
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });

import { initializeUI } from './ui.js';
import { showNotification } from './utils.js';


/**
 * Sets up theme toggle functionality with automatic dark mode detection
 * Dark mode is automatically enabled between 18:00-06:00 if no preference is saved
 * @function setupThemeToggle
 * @returns {void}
 */
function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');

    // Load saved theme or determine by time if not set
    chrome.storage.local.get('theme', (data) => {
        let theme = data.theme;
        if (!theme) {
            const hour = new Date().getHours();
            // Dark mode from 18:00 to 06:00
            if (hour >= 18 || hour < 6) {
                theme = 'dark';
            } else {
                theme = 'light';
            }
        }
        const isDark = theme === 'dark';
        document.body.classList.toggle('dark-theme', isDark);
        themeToggle.checked = isDark;
    });

    // Toggle theme on switch change
    themeToggle.addEventListener('change', () => {
        const isDark = themeToggle.checked;
        document.body.classList.toggle('dark-theme', isDark);
        chrome.storage.local.set({ theme: isDark ? 'dark' : 'light' });
    });
}

/**
 * Sets up event listeners for commit message generation buttons
 * Generates enhanced conventional commit prompts for different change types
 * @function setupCommitButtons
 * @returns {void}
 */
function setupCommitButtons() {
    const commitButtons = document.querySelectorAll('.commit-btn');
    commitButtons.forEach(button => {
        button.addEventListener('click', function () {
            const commandType = this.getAttribute('data-command');
            let commandString = '';

            // Enhanced conventional commit rules
            const baseRules = `Generate a conventional commit message following these enhanced rules:

STRUCTURE:
- Format: <type>[optional scope]: <description>
- Optional body and footer sections

TYPES (prioritized):
- feat: new features or capabilities
- fix: bug fixes or corrections  
- docs: documentation only changes
- style: formatting, missing semicolons (no code change)
- refactor: code change that neither fixes bug nor adds feature
- perf: performance improvements
- test: adding missing tests or correcting existing tests
- build: changes affecting build system or dependencies
- ci: changes to CI configuration files and scripts
- chore: other changes that don't modify src or test files
- revert: reverts a previous commit

GUIDELINES:
- Subject line: imperative mood, no period, under 50 chars
- Body: wrap at 72 characters, use present tense
- Include breaking changes in footer with 'BREAKING CHANGE:'
- Reference issues with 'Closes #123' or 'Fixes #456'
- Use scope for component/module (e.g., auth, ui, api)

EXAMPLES:
- feat(auth): add user login validation
- fix(ui): resolve button alignment on mobile
- docs: update API documentation for v2.0
- style: format code according to eslint rules
- refactor(core): simplify authentication logic`;

            switch (commandType) {
                case '1':
                    commandString = `echo "${baseRules}

ANALYZE THESE UNSTAGED CHANGES:
$(git diff --word-diff --stat)

DETAILED CHANGES:
$(git diff --word-diff)" | pbcopy`;
                    break;
                case '2':
                    commandString = `echo "${baseRules}

ANALYZE THESE STAGED CHANGES:
$(git diff --cached --word-diff --stat)

DETAILED CHANGES:
$(git diff --cached --word-diff)" | pbcopy`;
                    break;
                case '3':
                    commandString = `echo "${baseRules}

ANALYZE THESE RANGE CHANGES:
$(git diff main..HEAD --stat -- . ':(exclude)**/yarn.lock' ':(exclude)**/package-lock.json')

DETAILED CHANGES:
$(git diff main..HEAD --word-diff -- . ':(exclude)**/yarn.lock' ':(exclude)**/package-lock.json')" | pbcopy`;
                    break;
                default:
                    return;
            }

            navigator.clipboard.writeText(commandString).then(() => {
                const types = {
                    '1': 'Unstaged Changes Analysis',
                    '2': 'Staged Changes Analysis',
                    '3': 'Range Changes Analysis'
                };
                showNotification(`${types[commandType]} prompt copied!`, false, 'Conventional Commits');
            }).catch(err => {
                showNotification('Error copying to clipboard!', true);
            });
        });
    });
}

/**
 * Handles Chrome runtime messages for command execution
 * Processes EXECUTE_COMMAND type messages and generates AI prompts
 * @param {Object} request - The message request object
 */
chrome.runtime.onMessage.addListener(
    function (request) {
        if (request.type === 'EXECUTE_COMMAND') {
            const command = request.command;
            (async () => {
                try {
                    const result = await executeCommand(command);
                    const prompt = `Give me a commit suggestion on title and description with the "50/72" rule within a backtick format based for the following information:\n${command}`;
                    navigator.clipboard.writeText(prompt).then(() => {
                        showNotification('Commit message copied to clipboard!', false, 'AI-Generated');
                    }).catch(err => {
                        showNotification('Error copying to clipboard!', true);
                    });
                } catch (e) {
                    showNotification('Error executing command: ' + e.message, true);
                }
            })();
        }
    }
);

/**
 * Executes shell commands via Chrome extension messaging
 * @param {string} command - The shell command to execute
 * @returns {Promise<Object>} Promise resolving to command execution result
 * @throws {Error} When command execution fails
 */
async function executeCommand(command) {
    try {
        const result = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                type: 'EXECUTE_COMMAND_TOOL',
                command: command
            }, function (response) {
                if (response && response.output) {
                    resolve({ output: response.output });
                } else if (response && response.error) {
                    reject({ error: response.error });
                } else {
                    reject(new Error('Unknown error'));
                }
            });
        });
        return result;
    } catch (e) {
        console.error("Failed to execute command:", e);
        throw e;
    }
}


/**
 * Generates PR command with proper shell escaping
 * @param {string} prText - The PR title and description text
 * @returns {string} The formatted printf command string for local execution
 */
function generatePRCommand(prText) {
    // Escape single quotes for shell command
    const escapedText = prText.replace(/'/g, "'\"'\"'");

    // Generate the printf command exactly as specified - this is a pure string
    // that will be copied to clipboard for the user to paste and execute locally
    const command = `printf "#create_pull_request\\n%b\\nowner: %s\\nrepo: %s\\nhead: %s\\nbase: %s\\n" '${escapedText}' "$(git config --get remote.origin.url | sed -E 's@.*:([^/]+)/.*@\\1@')" "$(git config --get remote.origin.url | sed -E 's@.*/([^/]+)\\.git@\\1@')" "$(git symbolic-ref --short HEAD)" "$(git remote show origin | awk '/HEAD branch/ {print $NF}')" | pbcopy`;

    return command;
}

/**
 * Validates PR input text
 * @param {string} text - The input text to validate
 * @returns {boolean} True if valid, false otherwise
 */
function validatePRInput(text) {
    return text && text.trim().length > 0;
}

/**
 * Handles PR command generation button click
 * Validates input, generates command, and copies to clipboard
 * @returns {void}
 */
function handlePRGeneration() {
    const textarea = document.getElementById('pr-description');
    const prText = textarea.value;

    // Validate input
    if (!validatePRInput(prText)) {
        showNotification('Please enter PR title and description', true);
        return;
    }

    try {
        // Generate the command string
        const command = generatePRCommand(prText);

        // Copy to clipboard
        navigator.clipboard.writeText(command).then(() => {
            showNotification('PR command copied to clipboard!', false, 'Pull Request');
        }).catch(() => {
            showNotification('Failed to copy command to clipboard', true);
        });
    } catch (error) {
        console.error('Error generating PR command:', error);
        showNotification('Error generating PR command', true);
    }
}

/**
 * Auto-resizes textarea height based on content
 * @param {HTMLTextAreaElement} textarea - The textarea element to resize
 * @returns {void}
 */
export function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 300) + 'px';
}

document.addEventListener('DOMContentLoaded', () => {
    initializeUI();
    setupCommitButtons();
    setupThemeToggle();

    // Setup auto-resize for textareas
    const textareas = document.querySelectorAll('#sentence, #korean-word');
    textareas.forEach(ta => {
        autoResize(ta); // Initial resize
        ta.addEventListener('input', () => autoResize(ta));
    });

    // Also resize on window changes
    window.addEventListener('resize', () => {
        textareas.forEach(autoResize);
    });

    // === Image Prompt Button Logic ===
    const generateImageBtn = document.getElementById('generate_image');
    const sentenceTextarea = document.getElementById('sentence');
    if (generateImageBtn && sentenceTextarea) {
        generateImageBtn.addEventListener('click', () => {
            const value = sentenceTextarea.value.trim();
            if (value) {
                const prompt = `Generate an image, 16:9, matching the vibe of ${value}`;
                navigator.clipboard.writeText(prompt).then(() => {
                    showNotification('Image prompt copied to clipboard!');
                }).catch(() => {
                    showNotification('Failed to copy image prompt', true);
                });
            } else {
                // Highlight textarea and show notification inside it
                sentenceTextarea.classList.add('error-highlight');
                const original = sentenceTextarea.value;
                sentenceTextarea.value = "You need to fill a sentence or a context so that 'Build Image Prompt' can work";
                sentenceTextarea.readOnly = true;
                setTimeout(() => {
                    sentenceTextarea.classList.remove('error-highlight');
                    sentenceTextarea.value = original;
                    sentenceTextarea.readOnly = false;
                }, 4000);
            }
        });
    }
});

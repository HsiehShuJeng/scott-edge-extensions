import { initializeUI } from './ui.js';
import { showNotification } from './utils.js';

// Theme toggle functionality
function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    
    // Load saved theme or default to light
    chrome.storage.local.get('theme', (data) => {
        const theme = data.theme || 'light';
        document.body.classList.toggle('dark-theme', theme === 'dark');
        themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    });

    // Toggle theme on button click
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-theme');
        const theme = isDark ? 'dark' : 'light';
        chrome.storage.local.set({ theme });
        themeToggle.textContent = isDark ? '☀️' : '🌙';
    });
}

// Add event listeners for commit buttons
function setupCommitButtons() {
    const commitButtons = document.querySelectorAll('.commit-btn');
    commitButtons.forEach(button => {
        button.addEventListener('click', function() {
            const commandType = this.getAttribute('data-command');
            let commandString = '';
            
            switch (commandType) {
                case '1':
                    commandString = `echo "Generate a conventional commit message for these unstaged changes. Follow these rules:
- Use format: <type>(<scope>): <subject>
- Keep subject under 50 characters
- Use imperative mood (e.g., 'Fix bug' not 'Fixed bug')
- Wrap body at 72 characters
- Use hyphen for bullet points with blank lines between
- Include change details from: $(git diff --word-diff)
- Valid types: feat, fix, docs, style, refactor, perf, test, chore
- Add scope if applicable (e.g., ui, api, config)" | pbcopy`;
                    break;
                case '2':
                    commandString = `echo "Generate a conventional commit message for these staged changes. Follow these rules:
- Use format: <type>(<scope>): <subject>
- Keep subject under 50 characters
- Use imperative mood (e.g., 'Fix bug' not 'Fixed bug')
- Wrap body at 72 characters
- Use hyphen for bullet points with blank lines between
- Include change details from: $(git diff --cached --word-diff)
- Valid types: feat, fix, docs, style, refactor, perf, test, chore
- Add scope if applicable (e.g., ui, api, config)" | pbcopy`;
                    break;
                case '3':
                    commandString = `echo "Generate a conventional commit message for these range changes. Follow these rules:
- Use format: <type>(<scope>): <subject>
- Keep subject under 50 characters
- Use imperative mood (e.g., 'Fix bug' not 'Fixed bug')
- Wrap body at 72 characters
- Use hyphen for bullet points with blank lines between
- Include change details from: $(git diff main..HEAD -- . ':(exclude)**/yarn.lock')
- Valid types: feat, fix, docs, style, refactor, perf, test, chore
- Add scope if applicable (e.g., ui, api, config)" | pbcopy`;
                    break;
                default:
                    return;
            }
            
            navigator.clipboard.writeText(commandString).then(() => {
                const types = {
                    '1': 'Unstaged Changes',
                    '2': 'Staged Changes',
                    '3': 'Range Changes'
                };
                showNotification('Commit message command copied to clipboard!', false, types[commandType]);
            }).catch(err => {
                showNotification('Error copying to clipboard!', true);
            });
        });
    });
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
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

async function executeCommand(command) {
    try {
        const result = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                type: 'EXECUTE_COMMAND_TOOL',
                command: command
            }, function(response) {
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

initializeUI();
setupCommitButtons();
setupThemeToggle();

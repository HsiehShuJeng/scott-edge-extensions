import { initializeUI } from './ui.js';
import { showNotification } from './utils.js';

// Add event listeners for commit buttons
function setupCommitButtons() {
    const commitButtons = document.querySelectorAll('.commit-btn');
    commitButtons.forEach(button => {
        button.addEventListener('click', function() {
            const commandType = this.getAttribute('data-command');
            let commandString = '';
            
            switch (commandType) {
                case '1':
                    commandString = `echo "Give me a commit suggestion on title and description with the \\"50/72\\" rule within a backtick format based for the following information: $(git diff --word-diff)
The title should be prefixed with proper category, e.g., [journal][todoist], if you can find it from the committed content. And I don't need backtick symbols to wrap the content of the title and description yet I do need you to generate the content generated in a way that I can copy and past onto a bash session for a git commit. And no need to show 'Title' and 'Description' again. Commite message sohuld be in the imperative. A hyphen is used for bullet list, preceded by a single space, with blank lines in between. Use a hanging indent" | pbcopy`;
                    break;
                case '2':
                    commandString = `echo "Give me a commit suggestion on title and description with the \\"50/72\\" rule within a backtick format based for the following information: $(git diff --cached --word-diff)
The title should be prefixed with proper category, e.g., [journal][todoist], if you can find it from the committed content. And I don't need backtick symbols to wrap the content of the title and description yet I do need you to generate the content generated in a way that I can copy and past onto a bash session for a git commit. And no need to show 'Title' and 'Description' again. Commite message sohuld be in the imperative. A hyphen is used for bullet list, preceded by a single space, with blank lines in between. Use a hanging indent" | pbcopy`;
                    break;
                case '3':
                    commandString = `echo "Give me suggestions on title and description based on the below information, please use 'title: ' and 'body: ' to attach corresponding content. $(git diff main..HEAD ':!yarn.lock')" | pbcopy`;
                    break;
                default:
                    return;
            }
            
            navigator.clipboard.writeText(commandString).then(() => {
                showNotification('Commit message command copied to clipboard!');
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
                        showNotification('Commit message copied to clipboard!');
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

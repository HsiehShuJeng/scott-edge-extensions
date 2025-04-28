// === Constants ===
export const ID_SENTENCE = 'sentence';
export const ID_WORDS = 'words';
export const ID_KOREAN_WORD = 'korean-word';
export const ID_RESULT_ENGLISH = 'result-english';
export const ID_RESULT_KOREAN = 'result-korean';
export const ID_LOCALITY_DROPDOWN = 'locality-dropdown';
export const ID_LOCALITY_DROPDOWN_KOREAN = 'locality-dropdown-korean';

// === Utilities ===
export function $(id) {
    return document.getElementById(id);
}

export function showNotification(message, isError = false) {
    const notification = document.createElement('div');
    notification.innerText = message;
    notification.style = `position: fixed; bottom: 20px; right: 20px; background-color: ${isError ? '#FF0000' : '#4CAF50'}; color: white; padding: 10px; border-radius: 5px; z-index: 10000;`;
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 1500);
}

export function copyToClipboard(text, notificationMessage) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification(notificationMessage);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        showNotification('Error copying to clipboard!', true);
    });
}

export function handleResultClick(inputElementId) {
    const element = document.getElementById(inputElementId);
    if (!element) {
        console.error("Element not found:", inputElementId);
        return;
    }
    if (element.tagName === "INPUT" && element.type === "text") {
        const inputValue = element.value;
        copyToClipboard(inputValue, "Copied to clipboard!");
    } else {
        console.error("Element is not a text input:", inputElementId);
    }
}

export function generateCommitMessagePrompt() {
    const commitMessageCommand = `echo "Give me a commit suggestion on title and description with the \"50/72\" rule within a backtick format based for the following information: \$(git diff --word-diff)\nThe title should be prefixed with proper category, e.g., [journal][todoist], if you can find it from the committed content. And I don't need backtick symbols to wrap the content of the title and description yet I do need you to generate the content generated in a way that I can copy and paste onto a bash session for a git commit. And no need to show 'Title' and 'Description' again. Commit message should be in the imperative. A hyphen is used for bullet list, preceded by a single space, with blank lines in between. Use a hanging indent" | pbcopy`;
    navigator.clipboard.writeText(commitMessageCommand).then(() => {
        showNotification('Commit message prompt has been copied to clipboard!');
    }).catch(err => {
        showNotification('Error copying commit message prompt to clipboard!', true);
    });
}

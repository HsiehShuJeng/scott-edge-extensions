/**
 * Functions to handle UI interactions and text generation.
 */
// Utility to handle clipboard actions with notifications
function copyToClipboard(text, notificationMessage) {
    navigator.clipboard.writeText(text).then(() => {
        showTemporaryNotification(notificationMessage);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        showTemporaryNotification('Error copying to clipboard!', true);
    });
}

// Generate detailed output for learning prompts
function generateOutput() {
    const words = document.getElementById('words').value.split(/[ ,]+/);
    const sentence = document.getElementById('sentence').value || null;
    let output = sentence ? `${sentence}\n\n` : "";
    const lastWord = words.pop();
    const combinedWords = words.length > 0 ? words.join("', '") + "', and '" + lastWord : lastWord;

    output += `What does '${combinedWords}' mean here? Give me the detailed explanation in English, its etymology stories in English, ` +
        `all the corresponding traditional Chinese translations, and sentences using the word ` +
        `in the real world either in conversations or books. Lastly, list the most 3 related ` +
        `synonyms and antonyms respectively with each term followed by its traditional Chinese ` +
        `translation.\n\n`;

    output += "The paragraph for the detailed explanation\n\n";
    output += "The paragraph for the etymology stories\n\n";
    output += "The paragraph for example sentences\n";
    output += "1. sentence 1\n";
    output += "2. sentence 2\n\n";
    output += "```html\n<b>翻譯</b>\n${translation1}；${translation2}\n\n<b>同義詞</b>\n1. synonym1，the translation of synonym1\n\n<b>反義詞</b>\n1. antonym1，the translation of antonym1\n```";

    copyToClipboard(output, 'Output has been generated and copied to clipboard!');
}

// Translation prompts for different languages
function generateTranslationPrompt(language) {
    const content = document.getElementById('sentence').value.trim();
    const prompt = `${content}\n\nPlease translate the above statement(s) into ${language === 'zh' ? 'Traditional Chinese' : 'English'} considering cultural and contextual connotations.`;
    copyToClipboard(prompt, `Translation prompt for ${language === 'zh' ? 'Traditional Chinese' : 'English'} has been copied to clipboard!`);
}

/**
 * Generate a detailed commit message prompt based on the Git diff,
 * and copy it to the clipboard to allow direct pasting into a bash session.
 */
function generateCommitMessagePrompt() {
    // This command combines the Git diff output with a prompt message on how to format the commit message
    const commitMessageCommand = `echo "Give me a commit suggestion on title and description with the \\"50/72\\" rule within a backtick format based for the following information: \$(git diff --word-diff)\\nThe title should be prefixed with proper category, e.g., [journal][todoist], if you can find it from the committed content. And I don't need backtick symbols to wrap the content of the title and description yet I do need you to generate the content generated in a way that I can copy and paste onto a bash session for a git commit. And no need to show 'Title' and 'Description' again. Commit message should be in the imperative. A hyphen is used for bullet list, preceded by a single space, with blank lines in between. Use a hanging indent" | pbcopy`;

    // Copy the constructed command to the clipboard
    navigator.clipboard.writeText(commitMessageCommand).then(() => {
        showTemporaryNotification('Commit message prompt has been copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy commit message prompt: ', err);
        showTemporaryNotification('Error copying commit message prompt to clipboard!', true);
    });
}

// Show a temporary notification on the screen
function showTemporaryNotification(message, isError = false) {
    const notification = document.createElement('div');
    notification.innerText = message;
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = isError ? '#FF0000' : '#4CAF50';
    notification.style.color = 'white';
    notification.style.padding = '10px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '10000';

    document.body.appendChild(notification);
    setTimeout(() => {
        document.body.removeChild(notification);
    }, 1500);
}

/**
 * Event listeners for UI interactions.
 */
document.getElementById('generate').addEventListener('click', generateOutput);
document.getElementById('translate_zh').addEventListener('click', () => generateTranslationPrompt('zh'));
document.getElementById('translate_en').addEventListener('click', () => generateTranslationPrompt('en'));
document.getElementById('generate_commit_message').addEventListener('click', generateCommitMessagePrompt);

// Toggle visibility for language sections on hover
function toggleSectionVisibility(targetId) {
    const sections = ['english-section', 'korean-section'];
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (sectionId === targetId) {
            section.style.opacity = '1';
            section.style.visibility = 'visible';
            section.style.height = 'auto';  // Adjust this as needed for your layout
        } else {
            section.style.opacity = '0';
            section.style.visibility = 'hidden';
            section.style.height = '0';  // Adjust this as needed for your layout
        }
    });
}

// Attach mouseenter event handlers to the flag buttons
document.getElementById('english-btn').addEventListener('mouseenter', () => {
    toggleSectionVisibility('english-section');
});
document.getElementById('korean-btn').addEventListener('mouseenter', () => {
    toggleSectionVisibility('korean-section');
});
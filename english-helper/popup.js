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

// Generate commit message prompt
function generateCommitMessagePrompt() {
    const gitDiff = "echo \"$(git diff --word-diff)\"";
    copyToClipboard(gitDiff, 'Commit message prompt has been copied to clipboard!');
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

// Toggle visibility for language sections
function toggleSectionVisibility(targetId) {
    const sections = ['english-section', 'korean-section'];
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (sectionId === targetId) {
            section.style.opacity = '1';
            section.style.visibility = 'visible';
            section.style.height = 'auto';
        } else {
            section.style.opacity = '0';
            section.style.visibility = 'hidden';
            section.style.height = '0';
        }
    });
}

document.getElementById('english-btn').addEventListener('click', () => toggleSectionVisibility('english-section'));
document.getElementById('korean-btn').addEventListener('click', () => toggleSectionVisibility('korean-section'));
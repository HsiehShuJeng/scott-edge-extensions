/**
 * Generate the desired prompt (question) for a given word and optional sentence.
 *
 * @param {string[]} words - The words to include in the output.
 * @param {string} [sentence] - An optional sentence to include in the output.
 * @returns {string} A formatted string with placeholders for explanations, etymology, translations, etc.
 */
function generate_output(words, sentence = null) {
    let output = "";

    if (sentence) {
        output += `${sentence}\n\n`;
    }
    const lastWord = words.pop();
    const combinedWords = words.length > 0 ? words.join("', '") + "', and '" + lastWord : lastWord;
    output += (
        `What does '${combinedWords}' mean here? Give me the detailed explanation in English, its etymology stories in English, ` +
        `all the corresponding traditional Chinese translations, and sentences using the word ` +
        `in the real world either in conversations or books. Lastly, list the most 3 related ` +
        `synonyms and antonyms respectively with each term followed by its traditional Chinese ` +
        `translation. Furthermore, I don't need the part like 'hài xiū de'. I wish it is displayed with the following form:\n\n`
    );

    output += "The paragraph for the detailed explanation\n\n";
    output += "The paragraph for the etymology stories\n\n";
    output += "The paragraph for example sentences\n";
    output += "1. sentence 1\n";
    output += "2. sentence 2\n\n";
    output += (
        "```html\n" +
        "<b>翻譯</b>\n" +
        "${translation1}；${translation2}\n\n" +
        "<b>同義詞</b>\n" +
        "1. synonym1，the translation of synonym1\n\n" +
        "<b>反義詞</b>\n" +
        "1. antonym1，the translation of antonym1\n" +
        "```"
    );
    return output;
}

/**
 * Generate the prompt for translation.
 *
 * @param {string} content - The content to be translated.
 * @param {string} language - The language for translation ("zh" for Chinese, "en" for English).
 * @returns {string} The generated prompt for translation.
 */
function generate_translation_prompt(content, language) {
    if (language === "zh") {
        return `${content}\n\nPlease translate the above statement(s) into Traditional Chinese considering cultural and contextual connotations. No need to explain further. Make sure the translation is Taiwan-friendly.`;
    } else if (language === "en") {
        return `${content}\n\nPlease translate the above statement(s) into English considering cultural and contextual connotations.`;
    }
    return "";
}

/**
 * Generate the commit message prompt.
 *
 * @returns {string} The generated commit message prompt.
 */
function generate_commit_message_prompt() {
    return `echo "Give me a commit suggestion on title and description with the \\"50/72\\" rule within a backtick format based for the following information: $(git diff --word-diff)
The title should be prefixed with proper category, e.g., [journal][todoist], if you can find it from the committed content. And I don't need backtick symbols to wrap the content of the title and description yet I do need you to generate the content generated in a way that I can copy and past onto a bash session for a git commit. And no need to show 'Title' and 'Description' again. Commit message should be in the imperative. A hyphen is used for bullet list, preceded by a single space, with blank lines in between. Use a hanging indent" | pbcopy`;
}

/**
 * Display a temporary notification with a specified message and duration.
 *
 * @param {string} message - The message to display in the notification.
 * @param {number} [duration=1500] - The duration in milliseconds for which the notification should be visible (default is 1500ms).
 */
function showTemporaryNotification(message, duration = 1500) {
    const notification = document.createElement('div');
    notification.innerText = message;
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = '#4CAF50';
    notification.style.color = 'white';
    notification.style.padding = '10px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '10000';

    document.body.appendChild(notification);

    setTimeout(() => {
        document.body.removeChild(notification);
    }, duration);
}

document.getElementById('generate').addEventListener('click', () => {
    const input = document.getElementById('words').value;
    const words = input.split(/[ ,]+/); // Split the input value by spaces or commas
    const sentence = document.getElementById('sentence').value || null;

    const result = generate_output(words, sentence);

    // Copy the result to the clipboard
    navigator.clipboard.writeText(result).then(() => {
        showTemporaryNotification('The question for ChatGPT 4 has been copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy output: ', err);
    });
});

document.getElementById('translate_zh').addEventListener('click', () => {
    const content = document.getElementById('sentence').value.trim();
    const prompt = generate_translation_prompt(content, "zh");

    // Copy the prompt to the clipboard
    navigator.clipboard.writeText(prompt).then(() => {
        showTemporaryNotification('Translation prompt for Traditional Chinese has been copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy prompt: ', err);
    });
});

document.getElementById('translate_en').addEventListener('click', () => {
    const content = document.getElementById('sentence').value.trim();
    const prompt = generate_translation_prompt(content, "en");

    // Copy the prompt to the clipboard
    navigator.clipboard.writeText(prompt).then(() => {
        showTemporaryNotification('Translation prompt for English has been copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy prompt: ', err);
    });
});

document.getElementById('generate_commit_message').addEventListener('click', () => {
    const prompt = generate_commit_message_prompt();

    // Copy the prompt to the clipboard
    navigator.clipboard.writeText(prompt).then(() => {
        showTemporaryNotification('Commit message prompt has been copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy prompt: ', err);
    });
});

document.getElementById('generate-korean').addEventListener('click', function() {
    const koreanInput = document.getElementById('korean-word');
    const textToCopy = koreanInput.value + " Break down the pronunciation and explain what it means in detail regarding grammar.";

    navigator.clipboard.writeText(textToCopy).then(() => {
        showTemporaryNotification('A prompt for Korean learning has been copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
});


function setEqualHeight() {
    const englishSection = document.getElementById('english-section');
    const koreanSection = document.getElementById('korean-section');

    const maxHeight = Math.max(englishSection.scrollHeight, koreanSection.scrollHeight);

    englishSection.style.height = maxHeight + 'px';
    koreanSection.style.height = maxHeight + 'px';
}

document.getElementById('english-btn').addEventListener('mouseenter', () => {
    setEqualHeight();
    document.getElementById('english-section').style.opacity = '1';
    document.getElementById('english-section').style.visibility = 'visible';
    document.getElementById('english-section').style.height = 'auto';

    document.getElementById('korean-section').style.opacity = '0';
    document.getElementById('korean-section').style.visibility = 'hidden';
    document.getElementById('korean-section').style.height = '0';
});

document.getElementById('korean-btn').addEventListener('mouseenter', () => {
    setEqualHeight();
    document.getElementById('korean-section').style.opacity = '1';
    document.getElementById('korean-section').style.visibility = 'visible';
    document.getElementById('korean-section').style.height = 'auto';

    document.getElementById('english-section').style.opacity = '0';
    document.getElementById('english-section').style.visibility = 'hidden';
    document.getElementById('english-section').style.height = '0';
});
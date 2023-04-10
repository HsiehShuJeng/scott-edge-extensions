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
    const word = document.getElementById('word').value;
    const sentence = document.getElementById('sentence').value || null;

    const result = generate_output(word, sentence);

    // Copy the result to the clipboard
    navigator.clipboard.writeText(result).then(() => {
        showTemporaryNotification('The question for ChatGPT 4 has been copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy output: ', err);
    });
});

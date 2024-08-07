async function getKoreanContent() {
    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
            try {
                await chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    files: ['content.js']
                });

                chrome.tabs.sendMessage(tabs[0].id, { action: "getKoreanContent" }, function (response) {
                    if (chrome.runtime.lastError) {
                        resolve(null);
                    } else if (response && response.content) {
                        resolve(response.content);
                    } else {
                        resolve(null);
                    }
                });
            } catch (error) {
                resolve(null);
            }
        });
    });
}

async function getSentenceContent() {
    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
            try {
                await chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    files: ['content.js']
                });

                chrome.tabs.sendMessage(tabs[0].id, { action: "getActiveSentenceContent" }, function (response) {
                    if (chrome.runtime.lastError) {
                        resolve(null);
                    } else if (response && response.content) {
                        resolve(response.content);
                    } else {
                        resolve(null);
                    }
                });
            } catch (error) {
                resolve(null);
            }
        });
    });
}

// Translation prompts for different languages
async function generateTranslationPrompt(language) {
    let content = document.getElementById('sentence').value.trim();
    console.log("Initial content:", content);

    // Try to get content from the webpage if the textarea is empty
    if (!content) {
        console.log("Attempting to get content from webpage");
        const sentenceContent = await getSentenceContent();
        console.log("Content from webpage:", sentenceContent);
        if (sentenceContent) {
            content = sentenceContent;
            document.getElementById('sentence').value = content;
        }
    }

    if (!content) {
        console.log("No content found");
        showNotification('No content to translate!', true);
        return;
    }

    console.log("Final content to translate:", content);
    const prompt = `${content}\n\nPlease translate the above statement(s) into ${language === 'zh' ? 'Traditional Chinese' : 'English'} considering cultural and contextual connotations.`;
    copyToClipboard(prompt, `Translation prompt for ${language === 'zh' ? 'Traditional Chinese' : 'English'} has been copied to clipboard!`);
}

// Utility to handle clipboard actions with notifications
function copyToClipboard(text, notificationMessage) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification(notificationMessage);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        showNotification('Error copying to clipboard!', true);
    });
}

// Function to handle input element click, copying its value to clipboard
function handleResultClick(inputElementId) {
    const element = document.getElementById(inputElementId);
    if (!element) {
        console.error("Element not found:", inputElementId);
        return;  // Exit if element doesn't exist
    }
    // Check if the element is an input and its type is 'text'
    if (element.tagName === "INPUT" && element.type === "text") {
        const inputValue = element.value;
        copyToClipboard(inputValue, "Copied to clipboard!");  // Using a fixed message for all calls from this function
    } else {
        console.error("Element is not a text input:", inputElementId);
    }
}

// Function to fetch the etymology explanation from Etymology Online
async function fetchEtymologyExplanation(word) {
    const response = await fetch(`https://www.etymonline.com/search?q=${word}`);
    const text = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');

    // Search for the div block with the specified class names
    const searchDiv = doc.querySelector('div.ant-col-xs-24.ant-col-sm-24.ant-col-md-24.ant-col-lg-17');

    if (searchDiv) {
        // Find all <a> tags with the title 'Origin and meaning of ${word}'
        const anchors = searchDiv.querySelectorAll(`a[title^="Origin and meaning of"]`);
        console.log('Number of anchors found:', anchors.length);

        for (const anchor of anchors) {
            // Get the parent div that contains the anchor and the explanation
            const parentDiv = anchor.closest('div[class*="word"]');
            if (!parentDiv) {
                console.log('Parent div not found for anchor:', anchor);
                continue;
            }

            const explanationElement = parentDiv.querySelector('p');
            console.log('Explanation element:', explanationElement);

            if (explanationElement && explanationElement.innerText.trim()) {
                const explanationText = explanationElement.innerText.trim();
                console.log('Explanation text:', explanationText);

                // Skip if the content prefixes with 'see ' or contains an <a> tag with class 'crossreference notranslate'
                if (!explanationText.startsWith('see ') && !explanationElement.querySelector('a.crossreference.notranslate')) {
                    console.log('Valid explanation element found:', explanationElement);
                    return explanationText;
                } else {
                    console.log('Explanation element skipped due to crossreference or prefix:', explanationElement);
                }
            } else {
                console.log('Explanation element is empty or not found');
            }
        }
    } else {
        console.log('Search div not found');
    }
    return 'No etymology explanation found.';
}
// Generate detailed output for learning prompts
async function generateOutput(language) {
    let wordsElementId, sentenceElementId, notificationMessage;
    if (language === 'korean') {
        wordsElementId = 'korean-word';
        notificationMessage = 'Korean prompt has been generated and copied to clipboard!';
    } else {
        wordsElementId = 'words';
        sentenceElementId = 'sentence';
        notificationMessage = 'Output has been generated and copied to clipboard!';
    }
    
    const words = document.getElementById(wordsElementId).value.trim().split(/[ ,]+/);
    
    let output = '';
    if (language === 'korean') {
        output = `${words.join(' ')}\nBreak down the pronunciation and explain what it means in detail.`;
    } else {
        const sentence = document.getElementById(sentenceElementId).value || null;
        output = sentence ? `${sentence}\n\n` : "";
        const lastWord = words.pop();
        const combinedWords = words.length > 0 ? words.join("', '") + "', and '" + lastWord : lastWord;
        const etymologyExplanation = await fetchEtymologyExplanation(lastWord);
     
        output += `What does '${combinedWords}' mean here? Give me the detailed explanation in English, its etymology stories in English, ` +
            `all the corresponding traditional Chinese translations, and sentences using the word ` +
            `in the real world either in conversations or books. Lastly, list the most 3 related ` +
            `synonyms and antonyms respectively with each term followed by its traditional Chinese ` +
            `translation.\n\n`;
        if (!etymologyExplanation.includes('No etymology explanation found.')) {
            output += `And the explanation from Etymology Online is as this: ${etymologyExplanation}\n\n`
        }

        output += "The paragraph for the detailed explanation\n\n";
        output += "The paragraph for the etymology stories\n\n";
        output += "The paragraph for example sentences\n";
        output += "1. sentence 1\n";
        output += "2. sentence 2\n\n";
        output += "```html\n<b>翻譯</b>\n${translation1}；${translation2}\n\n<b>同義詞</b>\n1. synonym1，the translation of synonym1\n\n<b>反義詞</b>\n1. antonym1，the translation of antonym1\n```";
    }

    copyToClipboard(output, notificationMessage);
}

// Translation prompts for different languages
async function generateTranslationPrompt(language) {
    let content = document.getElementById('sentence').value.trim();
    console.log("Initial content:", content);

    // Try to get content from the webpage if the textarea is empty
    if (!content) {
        console.log("Attempting to get content from webpage");
        const sentenceContent = await getSentenceContent();
        console.log("Content from webpage:", sentenceContent);
        if (sentenceContent) {
            content = sentenceContent;
            document.getElementById('sentence').value = content;
        }
    }

    if (!content) {
        console.log("No content found");
        showNotification('No content to translate!', true);
        return;
    }

    console.log("Final content to translate:", content);
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
        showNotification('Commit message prompt has been copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy commit message prompt: ', err);
        showNotification('Error copying commit message prompt to clipboard!', true);
    });
}


function showNotification(message, isError = false) {
    const notification = document.createElement('div');
    notification.innerText = message;
    notification.style = `position: fixed; bottom: 20px; right: 20px; background-color: ${isError ? '#FF0000' : '#4CAF50'}; color: white; padding: 10px; border-radius: 5px; z-index: 10000;`;
    document.body.appendChild(notification);
    setTimeout(() => document.body.removeChild(notification), 1500);
}

let maxHeight = 0; // This will store the maximum height

function calculateMaxHeight() {
    // Select the sections
    const sections = document.querySelectorAll('#english-section, #korean-section');
    
    // Iterate through each section to determine the maximum height
    sections.forEach(section => {
        let originalVisibility = section.style.visibility; // Store the original visibility
        let originalHeight = section.style.height;
        section.style.visibility = 'visible'; // Make section visible to measure it accurately
        section.style.height = 'auto'; // Reset height to calculate the natural height

        const currentHeight = section.offsetHeight;
        maxHeight = Math.max(maxHeight, currentHeight);

        section.style.visibility = originalVisibility; // Restore the original visibility
        section.style.height = originalHeight;
    });

    // Apply the calculated max height to all sections while preserving visibility
    applyMaxHeight();
}

function applyMaxHeight() {
    const sections = document.querySelectorAll('#english-section, #korean-section');
    sections.forEach(section => {
        section.style.height = `${maxHeight}px`; // Set all sections to the same max height
    });
}

// This function is called initially and whenever visibility needs to be toggled
function toggleSectionVisibility(targetId) {
    const sections = document.querySelectorAll('#english-section, #korean-section');
    sections.forEach(section => {
        if (section.id === targetId) {
            section.style.visibility = 'visible';
            section.style.height = `${maxHeight}px`;
            section.style.opacity = 1;
        } else {
            section.style.visibility = 'hidden';
            section.style.height = 0;
            section.style.opacity = 0;
        }
    });
}

function handleStartEnglishSession() {
    startTime = new Date(); // Get the current time
    const hours = startTime.getHours().toString().padStart(2, '0');
    const minutes = startTime.getMinutes().toString().padStart(2, '0');
    const currentTime = `${hours}:${minutes}`; // Format time in HH:mm format
    const localityDropdown = document.getElementById('locality-dropdown');
    const localityCode = localityDropdown.value;

    // Create the command string
    const command = `python record_english_learning.py '${currentTime}' -L 'English' -D ?? -LO ${localityCode}`;

    // Display the command in the result input field
    document.getElementById('result-english').value = command;
    copyToClipboard(command, 'Start command copied to clipboard!');
}

function handleEndEnglishSession() {
    const endTime = new Date(); // Get the current time as end time
    const duration = Math.round((endTime - startTime) / 60000); // Calculate duration in minutes

    const hours = startTime.getHours().toString().padStart(2, '0');
    const minutes = startTime.getMinutes().toString().padStart(2, '0');
    const startTimeFormatted = `${hours}:${minutes}`; // Format start time in HH:mm format
    const localityDropdown = document.getElementById('locality-dropdown');
    const localityCode = localityDropdown.value;

    // Update the command string with the actual duration
    const command = `python record_english_learning.py '${startTimeFormatted}' -L 'English' -D ${duration} -LO ${localityCode}`;
    document.getElementById('result-english').value = command;
    copyToClipboard(command, 'Start command copied to clipboard!');
}

// Function to handle the start of the Korean session
function handleStartKoreanSession() {
    startTime = new Date(); // Get the current time
    const hours = startTime.getHours().toString().padStart(2, '0');
    const minutes = startTime.getMinutes().toString().padStart(2, '0');
    const currentTime = `${hours}:${minutes}`; // Format time in HH:mm format
    const localityDropdown = document.getElementById('locality-dropdown-korean');
    const localityCode = localityDropdown.value;

    // Create the command string
    const command = `python record_english_learning.py '${currentTime}' -L 'Korean' -D ?? -LO ${localityCode}`;

    // Display the command in the result input field
    document.getElementById('result-korean').value = command;
    copyToClipboard(command, 'Start command copied to clipboard!');
}

// Function to handle the end of the Korean session
function handleEndKoreanSession() {
    const endTime = new Date(); // Get the current time as end time
    const duration = Math.round((endTime - startTime) / 60000); // Calculate duration in minutes

    const hours = startTime.getHours().toString().padStart(2, '0');
    const minutes = startTime.getMinutes().toString().padStart(2, '0');
    const startTimeFormatted = `${hours}:${minutes}`; // Format start time in HH:mm format
    const localityDropdown = document.getElementById('locality-dropdown-korean');
    const localityCode = localityDropdown.value;

    // Update the command string with the actual duration
    const command = `python record_english_learning.py '${startTimeFormatted}' -L 'Korean' -D ${duration} -LO ${localityCode}`;
    document.getElementById('result-korean').value = command;
    copyToClipboard(command, 'End command copied to clipboard!');
}

document.getElementById('translate_zh').addEventListener('click', () => generateTranslationPrompt('zh'));
document.getElementById('translate_en').addEventListener('click', () => generateTranslationPrompt('en'));
let startTime;  // Variable to store the start time
// Call this function to initiate the measurement and setup
document.addEventListener('DOMContentLoaded', () => {
    calculateMaxHeight(); // Calculate once and apply initially
    toggleSectionVisibility('english-section'); // Ensure English section is visible by default
});

document.getElementById('generate').addEventListener('click', () => generateOutput('english'));
document.getElementById('translate_zh').addEventListener('click', () => generateTranslationPrompt('zh'));
document.getElementById('translate_en').addEventListener('click', () => generateTranslationPrompt('en'));
document.getElementById('generate-korean').addEventListener('click', async () => {
    let content = document.getElementById('korean-word').value.trim();

    if (!content) {
        const koreanContent = await getKoreanContent();
        if (koreanContent) {
            content = koreanContent;
            document.getElementById('korean-word').value = content;
        }
    }

    if (!content) {
        showNotification('No content to generate!', true);
        return;
    }

    generateOutput('korean');
});
document.getElementById('generate_commit_message').addEventListener('click', generateCommitMessagePrompt);
// Attach mouseenter event handlers to the flag buttons
document.getElementById('english-btn').addEventListener('mouseenter', () => {
toggleSectionVisibility('english-section');
});
document.getElementById('korean-btn').addEventListener('mouseenter', () => {
toggleSectionVisibility('korean-section');
});
// Attach the event listener to the Start button
document.getElementById('start-english').addEventListener('click', handleStartEnglishSession);
document.getElementById('end-english').addEventListener('click', handleEndEnglishSession);
// Attach the event listeners to the Korean buttons
document.getElementById('start-korean').addEventListener('click', handleStartKoreanSession);
document.getElementById('end-korean').addEventListener('click', handleEndKoreanSession);
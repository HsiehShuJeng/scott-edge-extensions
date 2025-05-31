import { ID_SENTENCE, ID_WORDS, ID_KOREAN_WORD, copyToClipboard, $, showNotification } from './utils.js';
import { autoResize } from './popup.js';

export async function generateTranslationPrompt(language) {
    let content = $(ID_SENTENCE).value.trim();
    if (!content) {
        const sentenceContent = await getSentenceContent();
        if (sentenceContent) {
            content = sentenceContent;
            $(ID_SENTENCE).value = content;
        }
    }
    if (!content) {
        showNotification('No content to translate!', true);
        return;
    }
    const prompt_end = language === 'zh'
        ? 'natural to Taiwanese.'
        : 'natural to native speakers in the USA.';
    const prompt = `${content}\n\nPlease translate the above statement(s) into ${language === 'zh' ? 'Traditional Chinese' : 'English'} considering cultural and contextual connotations, and make it ${prompt_end}`;
    copyToClipboard(prompt, `Translation prompt for ${language === 'zh' ? 'Traditional Chinese' : 'English'} has been copied to clipboard!`);
}

export async function generateOutput(language) {
    let wordsElementId, sentenceElementId, notificationMessage;
    if (language === 'korean') {
        wordsElementId = ID_KOREAN_WORD;
        notificationMessage = 'Korean prompt has been generated and copied to clipboard!';
    } else {
        wordsElementId = ID_WORDS;
        sentenceElementId = ID_SENTENCE;
        notificationMessage = 'Output has been generated and copied to clipboard!';
    }
    const words = $(wordsElementId).value.trim().split(/[ ,]+/);
    let output = '';
    if (language === 'korean') {
        output = `${words.join(' ')}\nBreak down the pronunciation and explain what it means in detail.`;
    } else {
        const sentence = $(sentenceElementId).value || null;
        output = sentence ? `${sentence}\n\n` : "";
        const lastWord = words.pop();
        const combinedWords = words.length > 0 ? words.join("', '") + "', and '" + lastWord : lastWord;
        output += `What does '${combinedWords}' mean here? Give me the detailed explanation in English, its etymology stories in English, all the corresponding traditional Chinese translations, and sentences using the word in the real world either in conversations or books. Lastly, list the most 3 related synonyms and antonyms respectively with each term followed by its traditional Chinese translation.\n\n`;
        output += "The paragraph for the detailed explanation\n\n";
        output += "The paragraph for the etymology stories\n\n";
        output += "The paragraph for example sentences\n";
        output += "1. sentence 1\n";
        output += "2. sentence 2\n\n";
        output += "```html\n<b>翻譯</b>\n${translation1}；${translation2}\n\n<b>同義詞</b>\n1. synonym1，the translation of synonym1\n\n<b>反義詞</b>\n1. antonym1，the translation of antonym1\n```";
    }
    copyToClipboard(output, notificationMessage);
}

// Helper for fetching content from the active tab
export async function getSentenceContent() {
    console.log('[popup] getSentenceContent called');
    return new Promise(resolve => {
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
            try {
                await chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    files: ['content.js']
                });
                chrome.tabs.sendMessage(tabs[0].id, { action: "getActiveSentenceContent" }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('[popup] chrome.runtime.lastError:', chrome.runtime.lastError);
                        resolve(null);
                    } else {
                        const sentence = response?.sentence || '';
                        const word = response?.word || '';
                        if (sentence) {
                            $(ID_SENTENCE).value = sentence;
                            autoResize($(ID_SENTENCE));
                        }
                        if (word) {
                            $(ID_WORDS).value = word;
                        }
                        resolve(sentence);
                    }
                });
            } catch (error) {
                console.error('[popup] Exception in getSentenceContent:', error);
                resolve(null);
            }
        });
    });
}

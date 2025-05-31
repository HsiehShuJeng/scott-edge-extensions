console.log("[content.js] Script loaded and running");

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.type === 'COPY_COMMAND') {
            const command = request.command;
            sendResponse({ command: command });
            return true;
        } else if (request.action === "getActiveSentenceContent") {
            console.log("[content.js] Received getActiveSentenceContent message");

            // Helper to get plain text from a node, replacing <strong> tags with their text or underscores
            function getPlainSentenceText(node) {
                if (!node) return "";
                // Clone node to avoid modifying DOM
                const clone = node.cloneNode(true);
                // Replace <strong> tags with their text or underscores
                clone.querySelectorAll('strong').forEach(strong => {
                    // If the strong tag is just underscores or blanks, keep as underscores
                    if (/^_+$/.test(strong.textContent.trim()) || strong.textContent.trim() === "________") {
                        strong.replaceWith("________");
                    } else {
                        strong.replaceWith(strong.textContent);
                    }
                });
                // Remove all other tags, keep only text
                return clone.textContent.trim();
            }

            let selectedWord = "";
            let sentence = "";

            const selection = window.getSelection();
            let sentenceNode = null;

            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const container = range.commonAncestorContainer;
                selectedWord = selection.toString().trim();

                // Traverse up to find the .sentence container
                let currentNode = container.nodeType === 1 ? container : container.parentElement;
                while (currentNode && currentNode !== document.body) {
                    if (currentNode.classList && currentNode.classList.contains('sentence')) {
                        sentenceNode = currentNode;
                        break;
                    }
                    currentNode = currentNode.parentElement;
                }
            }

            // Always target the selected slide for the current question
            const currentSlide = document.querySelector('.challenge-slide.selected');
            if (currentSlide && currentSlide.querySelector('.question.typeT')) {
                // Spelling: get word from .correctspelling if available
                const correctSpelling = currentSlide.querySelector('.correctspelling');
                if (correctSpelling) {
                    selectedWord = correctSpelling.textContent.trim();
                } else {
                    // Fallback: first <strong> in .sentence.complete or .sentence.blanked
                    const complete = currentSlide.querySelector('.sentence.complete');
                    const blanked = currentSlide.querySelector('.sentence.blanked');
                    const sentenceNode = complete || blanked;
                    if (sentenceNode) {
                        const strong = sentenceNode.querySelector('strong');
                        if (strong) selectedWord = strong.textContent.trim();
                        sentence = sentenceNode.textContent.trim();
                    }
                }
                // Prefer .sentence.complete, fallback to .sentence.blanked for sentence
                if (!sentence) {
                    const complete = currentSlide.querySelector('.sentence.complete');
                    const blanked = currentSlide.querySelector('.sentence.blanked');
                    if (complete) sentence = complete.textContent.trim();
                    else if (blanked) sentence = blanked.textContent.trim();
                }
                console.log("[content.js] Spelling question detected. Word:", selectedWord, "Sentence:", sentence);
            } else if (currentSlide && currentSlide.querySelector('.question.typeD')) {
                // Definition-style multiple-choice: word from .instructions strong, sentence from choices
                const strong = currentSlide.querySelector('.instructions strong');
                if (strong) selectedWord = strong.textContent.trim();
                sentence = `What does ${selectedWord} mean?`;
                const choices = currentSlide.querySelectorAll('.choices > a');
                choices.forEach(choice => {
                    const key = choice.getAttribute('accesskey') || '';
                    // Get only the text node (not the inner div.tools)
                    let text = '';
                    for (const node of choice.childNodes) {
                        if (node.nodeType === Node.TEXT_NODE) {
                            text += node.textContent.trim();
                        }
                    }
                    if (!text) text = choice.textContent.trim();
                    sentence += `\n${key} ${text}`;
                });
                console.log("[content.js] Definition-style multiple-choice detected. Word:", selectedWord, "Sentence:", sentence);
            } else if (currentSlide && currentSlide.querySelector('.question.typeS')) {
                // Synonym-style multiple-choice: word from .instructions strong, sentence from choices
                const strong = currentSlide.querySelector('.instructions strong');
                if (strong) selectedWord = strong.textContent.trim();
                sentence = `${selectedWord} has the same or almost the same meaning as:`;
                const choices = currentSlide.querySelectorAll('.choices > a');
                choices.forEach(choice => {
                    const key = choice.getAttribute('accesskey') || '';
                    let text = '';
                    for (const node of choice.childNodes) {
                        if (node.nodeType === Node.TEXT_NODE) {
                            text += node.textContent.trim();
                        }
                    }
                    if (!text) text = choice.textContent.trim();
                    sentence += `\n${key} ${text}`;
                });
                sentence += `\nPlease explain with the 2 words`;
                console.log("[content.js] Synonym-style multiple-choice detected. Word:", selectedWord, "Sentence:", sentence);
            } else if (currentSlide && currentSlide.querySelector('.question.typeP')) {
                // Question-style multiple-choice: word from .sentence strong, sentence from question + choices
                const strong = currentSlide.querySelector('.questionContent .sentence strong');
                if (strong) selectedWord = strong.textContent.trim();
                // Start sentence with the question text
                const questionSentence = currentSlide.querySelector('.questionContent .sentence');
                sentence = questionSentence ? questionSentence.textContent.trim() : '';
                // Add choices
                const choices = currentSlide.querySelectorAll('.choices > a');
                choices.forEach(choice => {
                    const key = choice.getAttribute('accesskey') || '';
                    let text = '';
                    for (const node of choice.childNodes) {
                        if (node.nodeType === Node.TEXT_NODE) {
                            text += node.textContent.trim();
                        }
                    }
                    if (!text) text = choice.textContent.trim();
                    sentence += `\n${key} ${text}`;
                });
                sentence = sentence.trim();
                console.log("[content.js] Question-style multiple-choice detected. Word:", selectedWord, "Sentence:", sentence);
            } else {
                // If no selection or not inside a .sentence, try to find the sentence in the active slide
                if (!sentenceNode) {
                    if (currentSlide) {
                        sentenceNode = currentSlide.querySelector('.sentence');
                        console.log("[content.js] Using .challenge-slide.selected .sentence:", sentenceNode ? sentenceNode.textContent : "not found");
                    }
                }
                // Fallback: first visible .sentence element
                if (!sentenceNode) {
                    sentenceNode = Array.from(document.querySelectorAll('.sentence'))
                        .find(el => el.offsetParent !== null);
                    console.log("[content.js] Fallback to first visible .sentence:", sentenceNode ? sentenceNode.textContent : "not found");
                }

                if (sentenceNode) {
                    sentence = getPlainSentenceText(sentenceNode);
                }

                // If no word is selected via highlight, fall back to the <strong> text
                if (!selectedWord && sentenceNode) {
                    const strongElem = sentenceNode.querySelector('strong');
                    if (strongElem) {
                        selectedWord = strongElem.textContent.trim();
                    }
                }
                // If still no word, get the correct answer from the definition block in the active slide
                if (!selectedWord && currentSlide) {
                    const defWordElem = currentSlide.querySelector('.def .word');
                    if (defWordElem) {
                        selectedWord = defWordElem.textContent.trim();
                    }
                }
            }

            console.log("[content.js] Selected word:", selectedWord);
            console.log("[content.js] Extracted sentence:", sentence);

            sendResponse({ word: selectedWord, sentence: sentence });
            return true;
        }
    }
);

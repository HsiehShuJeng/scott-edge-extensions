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

            // If no selection or not inside a .sentence, try to find the sentence in the active slide
            if (!sentenceNode) {
                const activeSlide = document.querySelector('.challenge-slide.active.selected');
                if (activeSlide) {
                    sentenceNode = activeSlide.querySelector('.sentence');
                    console.log("[content.js] Using .challenge-slide.active.selected .sentence:", sentenceNode ? sentenceNode.textContent : "not found");
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
            if (!selectedWord) {
                const slideElem = document.querySelector('.challenge-slide.active.selected');
                if (slideElem) {
                    const defWordElem = slideElem.querySelector('.def .word');
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

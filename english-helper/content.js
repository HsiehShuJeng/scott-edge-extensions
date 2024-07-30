console.log("Content script loaded");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getActiveSentenceContent") {
        const activeSlide = Array.from(document.querySelectorAll('.challenge-slide.wide.audio-enabled'))
            .find(slide => slide.matches('.active.selected, .selected.saved.complete.incorrect, .selected.saved.complete.correct'));

        if (activeSlide) {
            const sentenceElement = activeSlide.querySelector('.sentence');
            const instructionsElement = activeSlide.querySelector('.instructions');
            const correctAnswerElement = activeSlide.querySelector('.choices .correct');
            let content = '';

            if (sentenceElement) {
                content += sentenceElement.innerText;
            }
            if (instructionsElement && (!sentenceElement || sentenceElement.innerText === '')) {
                if (content) content += '\n\n'; // Add a new line if both elements are present
                let instructionsContent = instructionsElement.innerText.replace(/:/g, ''); // Remove colons
                if (correctAnswerElement) {
                    let correctAnswer = correctAnswerElement.innerText;
                    instructionsContent = `why ${instructionsContent} '${correctAnswer}'?`; // Format instructions with the correct answer
                } else {
                    instructionsContent = `why ${instructionsContent}?`; // Format instructions without the correct answer
                }
                content += instructionsContent;
            }

            if (content) {
                sendResponse({ content });
            } else {
                sendResponse({ content: null });
            }
        } else {
            sendResponse({ content: null });
        }
    } else if (request.action === "getKoreanContent") {
        let koreanContentSet = new Set();

        // First logic: Search for span elements with data-test="challenge-tap-token-text"
        const koreanElements = Array.from(document.querySelectorAll('span[data-test="challenge-tap-token-text"]'));
        koreanElements.forEach(el => {
            const matches = el.innerText.match(/[\u3131-\uD79D]+/g); // Capture only Korean characters
            if (matches) {
                matches.forEach(match => koreanContentSet.add(match));
            }
        });

        // Second logic: If no span elements found, search for div with data-test="challenge challenge-characterIntro"
        if (koreanContentSet.size === 0) {
            const introElement = document.querySelector('div[data-test="challenge challenge-characterIntro"]');
            if (introElement) {
                const spanElements = Array.from(introElement.querySelectorAll('span'));
                spanElements.forEach(el => {
                    const matches = el.innerText.match(/[\u3131-\uD79D]+/g); // Capture only Korean characters
                    if (matches) {
                        matches.forEach(match => koreanContentSet.add(match));
                    }
                });
            }
        }

        // Third logic: If no span elements found in intro, search for span elements within div role="radiogroup"
        if (koreanContentSet.size === 0) {
            const radiogroupElements = Array.from(document.querySelectorAll('div[role="radiogroup"] span'));
            radiogroupElements.forEach(el => {
                const matches = el.innerText.match(/[\u3131-\uD79D]+/g); // Capture only Korean characters
                if (matches) {
                    matches.forEach(match => koreanContentSet.add(match));
                }
            });
        }

        // Fourth logic: Search for div with data-test="challenge challenge-translate" and then for span elements within it
        if (koreanContentSet.size === 0) {
            const translateElement = document.querySelector('div[data-test="challenge challenge-translate"]');
            if (translateElement) {
                const spanElements = Array.from(translateElement.querySelectorAll('span'));
                spanElements.forEach(el => {
                    const matches = el.innerText.match(/[\u3131-\uD79D]+/g); // Capture only Korean characters
                    if (matches) {
                        matches.forEach(match => koreanContentSet.add(match));
                    }
                });
            }
        }

        const koreanContent = Array.from(koreanContentSet).join('\n'); // Convert set to array and join with newline
        sendResponse({ content: koreanContent });
    }
});
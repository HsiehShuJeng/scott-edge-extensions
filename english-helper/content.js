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
        const koreanElements = Array.from(document.querySelectorAll('span[data-test="challenge-tap-token-text"]'));
        const koreanContent = koreanElements.map(el => el.innerText).join(' ');
        sendResponse({ content: koreanContent });
    }
});
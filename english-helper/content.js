console.log("Content script loaded");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Message received in content script:", request);
    if (request.action === "getSentenceContent") {
        const sentenceDiv = document.querySelector('.sentence');
        if (sentenceDiv) {
            console.log("Sentence found:", sentenceDiv.textContent.trim());
            sendResponse({ content: sentenceDiv.textContent.trim() });
        } else {
            console.log("No sentence div found");
            sendResponse({ content: null });
        }
    }
    return true;  // Keeps the message channel open for asynchronous response
});
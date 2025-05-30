chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.type === 'COPY_COMMAND') {
            const command = request.command;
            sendResponse({ command: command });
            return true;
        }
    }
);

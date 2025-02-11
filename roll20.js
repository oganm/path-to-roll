// Log that the script has loaded
console.log('Roll20 helper script loaded');

// Listen for messages from the Pathbuilder page
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Received message in Roll20:', message);

    if (message.type === 'PING') {
        // Respond to ping messages to verify the content script is loaded
        sendResponse({ status: 'ok' });
        return true;
    }

    if (message.type === 'ROLL_STRING') {
        console.log('Processing roll string:', message.rollString);

        // Try to find the chat input
        const chatInput = document.querySelector("#textchat-input > textarea");
        console.log('Found chat input:', !!chatInput);

        if (chatInput) {
            try {
                // Store the original value to verify the change
                const originalValue = chatInput.value;

                // Set the value and trigger an input event
                chatInput.value = message.rollString;
                console.log('Set chat input value to:', message.rollString);

                // Verify the value was set
                if (chatInput.value !== message.rollString) {
                    console.warn('Failed to set chat input value');
                    sendResponse({ success: false, error: 'Failed to set input value' });
                    return true;
                }

                // Create and dispatch the input event
                const inputEvent = new Event('input', { bubbles: true });
                chatInput.dispatchEvent(inputEvent);
                console.log('Dispatched input event');

                // Focus the input
                chatInput.focus();
                console.log('Focused chat input');

                // Try to submit the roll
                // First try the send button
                const sendButton = document.querySelector("#chatSendBtn");
                if (sendButton) {
                    console.log('Found send button, clicking it');
                    sendButton.click();
                } else {
                    // If no button, try pressing Enter
                    console.log('No send button found, simulating Enter key');
                    chatInput.dispatchEvent(new KeyboardEvent('keypress', {
                        key: 'Enter',
                        code: 'Enter',
                        keyCode: 13,
                        which: 13,
                        bubbles: true
                    }));
                }

                // Verify everything worked
                if (document.activeElement === chatInput) {
                    console.log('Roll string successfully submitted');
                    sendResponse({ success: true });
                } else {
                    console.warn('Something went wrong after setting the value');
                    sendResponse({
                        success: false,
                        error: 'Verification failed',
                        activeElement: document.activeElement === chatInput,
                        valueMatch: chatInput.value === message.rollString
                    });
                }
            } catch (error) {
                console.error('Error while setting roll string:', error);
                sendResponse({ success: false, error: error.message });
            }
        } else {
            console.warn('Chat input not found. Available textareas:',
                document.querySelectorAll('textarea').length);
            sendResponse({ success: false, error: 'Chat input not found' });
        }
    } else {
        console.log('Unknown message type:', message.type);
        sendResponse({ success: false, error: 'Unknown message type' });
    }
    return true; // Keep the message channel open for the async response
});
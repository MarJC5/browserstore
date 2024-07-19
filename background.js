browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.command === "getLocalStorageDetails") {
        browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            browser.tabs.executeScript(
                tabs[0].id,
                { file: "content.js" },
                (result) => {
                    sendResponse(result[0]);
                }
            );
        });
        return true;  // Keep the message channel open for sendResponse
    }
    
    // Listen delete
    if (message.command === "deleteLocalStorage") {
        browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            browser.tabs.executeScript(
                tabs[0].id,
                {
                    code: `localStorage.removeItem("${message.key}"); sessionStorage.removeItem("${message.key}");`
                },
                (result) => {
                    sendResponse(result);
                }
            );
        });
        return true;  // Keep the message channel open for sendResponse
    }
});
if (chrome.contextMenus) {
  chrome.contextMenus.removeAll(function () {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    } else {
      chrome.contextMenus.create({
        title: "Add to Prompt",
        contexts: ["selection"],
        id: "addToPrompt",
      });
    }
  });
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "addToPrompt") {
    const selectedText = info.selectionText;
    handleAddToPrompt(selectedText);
  }
});

function handleAddToPrompt(selectedText) {
  chrome.windows.create({
    url: chrome.runtime.getURL(
      `dialog.html?selectedText=${encodeURIComponent(selectedText)}`
    ),
    type: "popup",
    width: 520,
    height: 530,
  });
}

const feedbackFormUrl = "https://example.com/feedback";
chrome.runtime.setUninstallURL(feedbackFormUrl, () => {
  if (chrome.runtime.lastError) {
    console.error("Error setting uninstall URL: ", chrome.runtime.lastError);
  } else {
    console.log("Uninstall URL set successfully.");
  }
});

chrome.runtime.setUninstallURL("https://forms.gle/ckX2adtTPPGztujN8");

// In your content script
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.message !== "") {
//     alert(message.message);
//   }
// });

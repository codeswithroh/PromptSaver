chrome.contextMenus.removeAll(function () {
  chrome.contextMenus.create({
    title: "Add to Prompt",
    contexts: ["selection"],
    id: "addToPrompt",
  });
});

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

// In your content script
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.message !== "") {
//     alert(message.message);
//   }
// });

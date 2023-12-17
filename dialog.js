const dialogForm = document.getElementById("dialog-form");
const promptTitle = document.getElementById("dialog-prompt-title");
const promptText = document.getElementById("dialog-prompt-text");
const promptCategory = document.getElementById("dialog-prompt-category");
const promptTags = document.getElementById("dialog-prompt-tags");
const saveButton = document.getElementById("dialog-save-prompt");
const cancelButton = document.getElementById("dialog-cancel-prompt");

const urlParams = new URLSearchParams(window.location.search);
const selectedText = urlParams.get("selectedText");

if (selectedText) {
  promptText.value = selectedText;
}

function savePrompt(prompt) {
  chrome.storage.sync.get("prompts", (data) => {
    let prompts = data.prompts || [];
    prompts.push(prompt);
    chrome.storage.sync.set({ prompts: prompts }, () => {
      alert("Prompt saved successfully!");
      window.close();
    });
  });
}

saveButton?.addEventListener("click", function () {
  const prompt = {
    title: promptTitle.value,
    text: promptText.value,
    category: promptCategory.value,
    tags: promptTags.value.split(",").map((tag) => tag.trim()),
  };

  savePrompt(prompt);
  // chrome.runtime.sendMessage(prompt);

  promptTitle.value = "";
  promptText.value = "";
  promptTags.value = "";
  promptText.focus();
});

cancelButton?.addEventListener("click", () => {
  window.close();
});

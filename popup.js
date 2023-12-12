const promptList = document.getElementById("prompt-list");
const promptForm = document.getElementById("prompt-form");
const promptTitle = document.getElementById("prompt-title");
const promptText = document.getElementById("prompt-text");
const promptCategory = document.getElementById("prompt-category");
const promptTags = document.getElementById("prompt-tags");
const saveButton = document.getElementById("save-prompt");
const cancelButton = document.getElementById("cancel-prompt");
const addPromptButton = document.getElementById("add-prompt-button");

addPromptButton.addEventListener("click", () => {
  const promptForm = document.getElementById("prompt-form");
  promptForm.style.display = "flex";
  addPromptButton.style.display = "none";
});

cancelButton.addEventListener("click", () => {
  promptForm.style.display = "none";
  addPromptButton.style.display = "block";
});

// Load saved prompts
chrome.storage.sync.get((data) => {
  if (data.prompts) {
    renderPrompts(data.prompts);
  } else {
    promptList.innerHTML = "";
  }
});

// Load categories
(async () => {
  const categories = await getCategories(); // Implement logic to get categories from API or source
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.innerText = category;
    promptCategory.appendChild(option);
  });
})(); // Load categories asynchronously

function savePrompt(prompt) {
  chrome.storage.sync.get("prompts", (data) => {
    let prompts = data.prompts || [];

    // Add the new prompt to the array
    prompts.push(prompt);

    chrome.storage.sync.set({ prompts: prompts }, () => {
      alert("Prompt saved successfully!");
    });
  });
  promptForm.style.display = "none";
  addPromptButton.style.display = "block";
}

// Save prompt
saveButton.addEventListener("click", () => {
  if (!validatePrompt()) {
    return; // Display error message if validation fails
  }

  const prompt = {
    title: promptTitle.value,
    text: promptText.value,
    category: promptCategory.value,
    tags: promptTags.value.split(",").map((tag) => tag.trim()),
  };

  promptList.innerHTML = "";
  savePrompt(prompt);

  // Clear form and reset focus
  promptTitle.value = "";
  promptText.value = "";
  promptTags.value = "";
  promptText.focus();

  renderPrompt(prompt);
});

// Handle prompt editing
// ... (Implement logic to edit prompts, e.g., click event listener on prompt element)

function renderPrompts(prompts) {
  if (prompts.length) {
    prompts.forEach((prompt) => renderPrompt(prompt));
  } else {
    const textElement = document.createElement("div");
    textElement.innerText = "No prompt to show";
    textElement.classList.add("text-center", "my-4", "prompt");
    promptList.appendChild(textElement);
  }
}

function renderPrompt(prompt) {
  const promptElement = document.createElement("div");
  promptElement.classList.add("prompt");

  const promptActions = document.createElement("div");
  promptActions.classList.add("d-flex");

  const promptContent = document.createElement("div");
  promptContent.classList.add("prompt-content", "hidden");

  const titleElement = document.createElement("h3");
  titleElement.classList.add("prompt-title");
  titleElement.innerText = prompt.title;

  const showButton = document.createElement("button");
  showButton.classList.add("btn", "secondary", "shadow");
  showButton.innerText = "Show";
  showButton.addEventListener("click", () => {
    promptContent.classList.toggle("hidden");
    showButton.innerText = promptContent.classList.contains("hidden")
      ? "Show"
      : "Hide";
  });

  // COPY Button
  const copyButton = document.createElement("button");
  copyButton.classList.add("btn", "success", "shadow");
  copyButton.innerText = "Copy";
  copyButton.addEventListener("click", () => {
    navigator.clipboard.writeText(prompt.text).then(() => {
      alert("Prompt copied successfully!");
    });
  });

  // DELETE button
  const deleteButton = document.createElement("button");
  deleteButton.classList.add("btn", "danger", "shadow");
  deleteButton.innerText = "Delete";
  deleteButton.addEventListener("click", () => {
    const confirmation = confirm(
      "Are you sure you want to delete this prompt?"
    );
    if (!confirmation) return;
    chrome.storage.sync.get("prompts", (data) => {
      let prompts = data.prompts;
      const promptIndex = prompts.findIndex((p) => p.text === prompt.text);
      prompts.splice(promptIndex, 1);
      chrome.storage.sync.set({ prompts }, () => {
        alert("Prompt deleted successfully!");
        promptElement.remove();
      });
    });
  });

  // PROMPT text
  const promptText = document.createElement("div");
  promptText.innerText = prompt.text;

  // TAGS
  const tagsElement = document.createElement("span");
  tagsElement.classList.add("tags");
  tagsElement.innerText = prompt.tags.join(", ");

  promptContent.appendChild(promptText);
  // promptContent.appendChild(tagsElement);

  promptActions.appendChild(showButton);
  promptActions.appendChild(copyButton);
  promptActions.appendChild(deleteButton);

  promptElement.appendChild(titleElement);
  promptElement.appendChild(promptActions);
  promptElement.appendChild(promptContent);

  // Append the prompt element to the prompt list
  promptList.appendChild(promptElement);
}

function validatePrompt() {
  // Implement logic to validate prompt text and tags
  // e.g., check if text is empty or tags are invalid
  return true; // Replace this with actual validation logic
}

async function getCategories() {
  // Implement logic to retrieve categories from API or source
  // e.g., using fetch API or accessing a JSON file
  return []; // Replace this with actual category data
}

// ... (Additional functions for prompt editing)

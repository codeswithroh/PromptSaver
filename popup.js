const promptList = document.getElementById("prompt-list");
const promptForm = document.getElementById("prompt-form");
const promptText = document.getElementById("prompt-text");
const promptCategory = document.getElementById("prompt-category");
const promptTags = document.getElementById("prompt-tags");
const saveButton = document.getElementById("save-prompt");

// Load saved prompts
chrome.storage.sync.get((data) => {
  if (data.prompts) {
    renderPrompts(data.prompts);
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
  // Get existing prompts from storage (or initialize an empty array)
  chrome.storage.sync.get("prompts", (data) => {
    let prompts = data.prompts || [];

    // Add the new prompt to the array
    prompts.push(prompt);

    // Save the updated array to storage
    chrome.storage.sync.set({ prompts: prompts }, () => {
      console.log("Prompt saved successfully!");
    });
  });
}

// Save prompt
saveButton.addEventListener("click", () => {
  if (!validatePrompt()) {
    return; // Display error message if validation fails
  }

  const prompt = {
    text: promptText.value,
    category: promptCategory.value,
    tags: promptTags.value.split(",").map((tag) => tag.trim()),
  };

  savePrompt(prompt); // Implement logic to save the prompt using chrome.storage.sync.set

  // Clear form and reset focus
  promptText.value = "";
  promptTags.value = "";
  promptText.focus();

  renderPrompt(prompt);
});

// Handle prompt editing
// ... (Implement logic to edit prompts, e.g., click event listener on prompt element)

function renderPrompts(prompts) {
  promptList.innerHTML = "";
  prompts.forEach((prompt) => renderPrompt(prompt));
}

function renderPrompt(prompt) {
  const promptElement = document.createElement("div");
  promptElement.classList.add("prompt");

  // Add text element
  const textElement = document.createElement("p");
  textElement.innerText = prompt.text;
  promptElement.appendChild(textElement);

  // Add category element
  const categoryElement = document.createElement("span");
  categoryElement.classList.add("category");
  categoryElement.innerText = prompt.category;
  promptElement.appendChild(categoryElement);

  // Add tags element
  const tagsElement = document.createElement("span");
  tagsElement.classList.add("tags");
  tagsElement.classList.add("px-4");
  tagsElement.innerText = prompt.tags.join(", ");
  promptElement.appendChild(tagsElement);

  // Add copy button
  const copyButton = document.createElement("button");
  copyButton.innerText = "Copy";
  copyButton.className = "copy-btn";
  copyButton.addEventListener("click", () => {
    navigator.clipboard.writeText(prompt.text).then(() => {
      console.log("Prompt copied successfully!");
    });
  });
  promptElement.appendChild(copyButton);

  // Add delete button
  const deleteButton = document.createElement("button");
  deleteButton.innerText = "Delete";
  deleteButton.addEventListener("click", () => {
    // Prompt confirmation before deleting
    const confirmation = confirm(
      "Are you sure you want to delete this prompt?"
    );
    if (!confirmation) return;

    // Get the current prompts from storage
    chrome.storage.sync.get("prompts", (data) => {
      let prompts = data.prompts;

      // Find the index of the prompt to delete
      const promptIndex = prompts.findIndex((p) => p.text === prompt.text);

      // Remove the prompt from the array
      prompts.splice(promptIndex, 1);

      // Save the updated array back to storage
      chrome.storage.sync.set({ prompts }, () => {
        console.log("Prompt deleted successfully!");

        // Update the UI by removing the prompt element
        promptElement.remove();
      });
    });
  });

  promptElement.appendChild(deleteButton);

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

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
  // Get existing prompts from storage (or initialize an empty array)
  chrome.storage.sync.get("prompts", (data) => {
    let prompts = data.prompts || [];

    // Add the new prompt to the array
    prompts.push(prompt);

    chrome.storage.sync.set({ prompts: prompts }, () => {
      alert("Prompt saved successfully!");
    });
  });
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
    textElement.classList.add("text-center");
    textElement.classList.add("my-4");
    promptList.appendChild(textElement);
  }
}

function renderPrompt(prompt) {
  // Create the prompt element and add class
  const promptElement = document.createElement("div");
  promptElement.classList.add("prompt");
  // promptElement.classList.add("hidden"); // Initially hide the prompt

  // Create title element with text and category
  const titleElement = document.createElement("h3");
  titleElement.classList.add("prompt-title");
  titleElement.innerText = prompt.title;

  // Create button to show/hide prompt details
  const showButton = document.createElement("button");
  showButton.classList.add("show-btn");
  showButton.classList.add("copy-btn");
  showButton.innerText = "Show";
  showButton.addEventListener("click", () => {
    promptElement.classList.toggle("hidden");
    showButton.innerText = promptElement.classList.contains("hidden")
      ? "Show"
      : "Hide";
  });

  // Create element for prompt details
  const promptText = document.createElement("div");
  promptText.classList.add("prompt-text", "hidden"); // Initially hide details
  promptText.innerText = prompt.text;

  // Create element for prompt details
  const detailsElement = document.createElement("div");
  detailsElement.classList.add("prompt-details", "hidden"); // Initially hide details

  // Add tags element with comma-separated tags
  const tagsElement = document.createElement("span");
  tagsElement.classList.add("tags");
  tagsElement.innerText = prompt.tags.join(", ");
  detailsElement.appendChild(tagsElement);

  // Add copy button with functionality
  const copyButton = document.createElement("button");
  copyButton.classList.add("copy-btn");
  copyButton.innerText = "Copy";
  copyButton.addEventListener("click", () => {
    navigator.clipboard.writeText(prompt.text).then(() => {
      alert("Prompt copied successfully!");
    });
  });
  detailsElement.appendChild(copyButton);

  // Add delete button with confirmation
  const deleteButton = document.createElement("button");
  deleteButton.classList.add("delete-btn");
  deleteButton.innerText = "Delete";
  deleteButton.addEventListener("click", () => {
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
        alert("Prompt deleted successfully!");

        // Update the UI by removing the prompt element
        promptElement.remove();
      });
    });
  });
  detailsElement.appendChild(deleteButton);

  // Append elements to the prompt element
  promptElement.appendChild(titleElement);
  promptElement.appendChild(showButton);
  promptElement.appendChild(promptText);
  promptElement.appendChild(detailsElement);

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

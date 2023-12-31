window.onload = function () {
  const promptList = document.getElementById("prompt-list");
  const promptForm = document.getElementById("prompt-form");
  const promptTitle = document.getElementById("prompt-title");
  const promptText = document.getElementById("prompt-text");
  const promptCategory = document.getElementById("prompt-category");
  const promptTags = document.getElementById("prompt-tags");
  const addPromptButton = document.getElementById("add-prompt-button");
  const cancelButton = document.getElementById("cancel-prompt");
  const settingsButton = document.getElementById("settings-button");
  const saveButton = document.getElementById("save-prompt");
  const categoryList = document.getElementById("category-list");

  if (settingsButton) {
    settingsButton.addEventListener("click", function () {
      var dialog = document.createElement("dialog");
      dialog.classList.add("dialog-menu");
      dialog.style.position = "relative";

      var closeButton = document.createElement("button");
      closeButton.textContent = "X";
      closeButton.style.position = "absolute";
      closeButton.style.right = "10px";
      closeButton.style.top = "10px";
      closeButton.classList.add("outline-button", "outline-warning", "shadow");
      closeButton.addEventListener("click", function () {
        dialog.close();
        document.body.removeChild(dialog);
      });
      dialog.appendChild(closeButton);

      const title = document.createElement("h2");
      title.textContent = "Settings";
      title.classList.add("text-center");
      dialog.appendChild(title);

      const buttonLayout = document.createElement("div");
      buttonLayout.classList.add("button-layout");

      var exportButton = document.createElement("button");
      exportButton.classList.add("btn", "primary", "shadow", "custom-button");
      exportButton.id = "exportButton";
      exportButton.textContent = "Export Prompts to CSV";

      var importButton = document.createElement("button");
      importButton.classList.add("btn", "secondary", "shadow", "custom-button");
      importButton.id = "importButton";
      importButton.textContent = "Import Promps from CSV";

      var sendFeedbackButton = document.createElement("button");
      sendFeedbackButton.classList.add(
        "btn",
        "dark",
        "shadow",
        "custom-button"
      );
      sendFeedbackButton.id = "sendFeedbackButton";
      sendFeedbackButton.textContent = "Send Feedback";

      buttonLayout.appendChild(exportButton);
      buttonLayout.appendChild(importButton);
      buttonLayout.appendChild(sendFeedbackButton);

      dialog.appendChild(buttonLayout);

      document.body.appendChild(dialog);
      dialog.showModal();

      document
        .getElementById("sendFeedbackButton")
        .addEventListener("click", function () {
          chrome.tabs.create({ url: "https://forms.gle/XZ7ZfpSXkz2LJAMdA" });
        });

      document
        .getElementById("exportButton")
        .addEventListener("click", function () {
          chrome.storage.sync.get("prompts", function (data) {
            var prompts = data.prompts;
            var csvContent = "title,prompt,category\n";
            prompts.forEach(function (prompt) {
              csvContent +=
                prompt.title +
                "," +
                prompt.text +
                "," +
                prompt.category.trim() +
                "\n";
            });

            var blob = new Blob([csvContent], {
              type: "text/csv;charset=utf-8;",
            });
            var url = URL.createObjectURL(blob);
            var link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", "prompts.csv");
            link.click();
          });
        });

      document
        .getElementById("importButton")
        .addEventListener("click", function () {
          var input = document.createElement("input");
          input.type = "file";
          input.accept = ".csv";
          input.onchange = function (event) {
            var file = event.target.files[0];
            var reader = new FileReader();
            reader.onload = function (e) {
              var contents = e.target.result;
              var lines = contents.split("\n");
              function savePromptsSequentially(lines, index) {
                if (index >= lines.length) {
                  alert("All prompts saved successfully!");
                  dialog.close();
                  document.body.removeChild(dialog);
                  promptList.innerHTML = "";
                  chrome.storage.sync.get((data) => {
                    if (data.prompts) {
                      renderCategories();
                      renderPrompts(data.prompts);
                    } else {
                      promptList.innerHTML = "";
                    }
                  });
                  return;
                }

                var line = lines[index];
                if (line) {
                  var parts = line.split(",");
                  const prompt = {
                    title: parts[0],
                    text: parts[1],
                    category: parts[2],
                  };
                  chrome.storage.sync.get("prompts", (data) => {
                    let prompts = data.prompts || [];
                    prompts.push(prompt);
                    chrome.storage.sync.set({ prompts: prompts }, () => {
                      console.log("Prompt saved successfully!");
                      savePromptsSequentially(lines, index + 1);
                    });
                  });
                } else {
                  savePromptsSequentially(lines, index + 1);
                }
              }

              savePromptsSequentially(lines, 1);
            };
            reader.readAsText(file);
          };
          input.click();
        });
    });
  }

  const categories = ["all", "coding", "study", "writing", "others"];

  addPromptButton?.addEventListener("click", () => {
    const promptForm = document.getElementById("prompt-form");
    promptForm.style.display = "flex";
    addPromptButton.style.display = "none";
  });

  cancelButton?.addEventListener("click", () => {
    promptForm.style.display = "none";
    addPromptButton.style.display = "block";
  });

  chrome.storage.sync.get((data) => {
    if (data.prompts) {
      renderCategories();
      renderPrompts(data.prompts);
    } else {
      promptList.innerHTML = "";
    }
  });

  function savePrompt(prompt) {
    chrome.storage.sync.get("prompts", (data) => {
      let prompts = data.prompts || [];

      prompts.push(prompt);

      chrome.storage.sync.set({ prompts: prompts }, () => {
        alert("Prompt saved successfully!");
      });
    });
    promptForm.style.display = "none";
    addPromptButton.style.display = "block";
  }

  saveButton?.addEventListener("click", () => {
    const prompt = {
      title: promptTitle.value,
      text: promptText.value,
      category: promptCategory.value,
      tags: promptTags.value.split(",").map((tag) => tag.trim()),
    };

    savePrompt(prompt);

    promptTitle.value = "";
    promptText.value = "";
    promptTags.value = "";
    promptText.focus();

    renderPrompt(prompt);
  });

  function renderCategories() {
    if (categories.length) {
      categoryList.innerHTML = "";

      categories.forEach((category, index) => {
        const categoryElement = document.createElement("span");
        categoryElement.innerText = category;
        categoryElement.classList.add("category-pill");
        categoryList.appendChild(categoryElement);

        categoryElement.addEventListener("click", () => {
          categoryList.querySelectorAll(".category-pill").forEach((element) => {
            element.style.backgroundColor = "";
            element.style.color = "";
          });

          categoryElement.style.backgroundColor = "#8f369b";
          categoryElement.style.color = "white";

          promptList.innerHTML = "";
          chrome.storage.sync.get((data) => {
            if (data.prompts) {
              renderPrompts(data.prompts, categoryElement.innerText);
            } else {
              promptList.innerHTML = "";
            }
          });
        });

        if (index === 0) {
          categoryElement.style.backgroundColor = "#8f369b";
          categoryElement.style.color = "white";
        }
      });
    } else {
      const textElement = document.createElement("div");
      textElement.innerText = "No category to show";
      textElement.classList.add("text-center", "my-4", "category");
      categoryList.appendChild(textElement);
    }
  }

  function renderPrompts(prompts, category = "all") {
    let promptFound = false;

    prompts.forEach((prompt) => {
      if (category === "all") {
        renderPrompt(prompt);
        promptFound = true;
      } else if (prompt.category.trim() === category) {
        renderPrompt(prompt);
        promptFound = true;
      }
    });

    if (!promptFound) {
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
    showButton?.addEventListener("click", () => {
      promptContent.classList.toggle("hidden");
      showButton.innerText = promptContent.classList.contains("hidden")
        ? "Show"
        : "Hide";
    });

    const copyButton = document.createElement("button");
    copyButton.classList.add("btn", "success", "shadow");
    copyButton.innerText = "Copy";
    copyButton?.addEventListener("click", () => {
      navigator.clipboard.writeText(prompt.text).then(() => {
        alert("Prompt copied successfully!");
      });
    });

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("btn", "danger", "shadow");
    deleteButton.innerText = "Delete";
    deleteButton?.addEventListener("click", () => {
      const confirmation = confirm(
        "Are you sure you want to delete this prompt?"
      );
      if (!confirmation) return;
      chrome.storage.sync.get("prompts", (data) => {
        let prompts = data.prompts;
        const promptIndex = prompts.findIndex((p) => p.title === prompt.title);
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

    // Edit button
    const editButton = document.createElement("button");
    editButton.classList.add("outline-button", "outline-primary", "shadow");
    editButton.innerText = "Edit";
    editButton?.addEventListener("click", () => {
      promptContent.removeChild(editButton);

      const textarea = document.createElement("textarea");
      textarea.classList.add("prompt-form-textarea-edit");
      textarea.value = prompt.text;

      const saveButton = document.createElement("button");
      saveButton.classList.add("outline-button", "outline-primary", "shadow");
      saveButton.innerText = "Save";

      const cancelButton = document.createElement("button");
      cancelButton.classList.add("outline-button", "outline-accent", "shadow");
      cancelButton.innerText = "Cancel";

      cancelButton?.addEventListener("click", () => {
        promptContent.removeChild(textarea);
        promptContent.removeChild(saveButton);
        promptContent.removeChild(cancelButton);
        promptContent.appendChild(promptText);
        promptContent.appendChild(editButton);
      });

      saveButton?.addEventListener("click", () => {
        prompt.text = textarea.value;
        promptText.innerText = textarea.value;

        chrome.storage.sync.get("prompts", (data) => {
          let prompts = data.prompts;
          const promptIndex = prompts.findIndex((p) => p.text === prompt.text);
          prompts.splice(promptIndex, 1, prompt);
          chrome.storage.sync.set({ prompts }, () => {
            alert("Prompt updated successfully!");
          });
        });

        promptContent.removeChild(textarea);
        promptContent.removeChild(saveButton);
        promptContent.removeChild(cancelButton);
        promptContent.appendChild(promptText);
        promptContent.appendChild(editButton);
      });

      promptContent.replaceChild(textarea, promptText);
      promptContent.appendChild(saveButton);
      promptContent.appendChild(cancelButton);
    });

    // TAGS
    const tagsElement = document.createElement("span");
    tagsElement.classList.add("tags");
    tagsElement.innerText = prompt?.tags?.join(", ") || "";

    promptContent.appendChild(promptText);
    promptContent.appendChild(editButton);

    promptActions.appendChild(showButton);
    promptActions.appendChild(copyButton);
    promptActions.appendChild(deleteButton);

    promptElement.appendChild(titleElement);
    promptElement.appendChild(promptActions);
    promptElement.appendChild(promptContent);

    promptList.appendChild(promptElement);
  }
};

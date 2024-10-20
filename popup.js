document.addEventListener("DOMContentLoaded", () => {
  const o1PreviewStorageKey = "o1PreviewRequestData";
  const gpt4oStorageKey = "gpt4oRequestData";

  const models = [
    ["o1Preview", { storageKey: o1PreviewStorageKey, resetIntervalHours: 24 * 7 }],
    ["gpt-4o", { storageKey: gpt4oStorageKey, resetIntervalHours: 3 }],
  ];
  const modelsMap = new Map(models);

  const editDateModal = document.getElementById("editDateModal");
  const closeModalButton = document.querySelector(".close");
  const saveDateButton = document.getElementById("saveDateButton");
  let currentEditKey = null;

  const updateCounts = () => {
    const modelStorageKeys = Array.from(modelsMap.values()).map((model) => model.storageKey);

    chrome.storage.local.get(modelStorageKeys, (result) => {
      modelsMap.forEach((model, key) => {
        const modelData = result[model.storageKey] || { count: 0, startDate: new Date().getTime() };
        document.getElementById(`${key}Count`).textContent = modelData.count;

        const resetDate = new Date(modelData.startDate);
        resetDate.setHours(resetDate.getHours() + model.resetIntervalHours);

        document.getElementById(
          `${key}Reset`
        ).textContent = `Resets: ${resetDate.toLocaleDateString()} ${resetDate.toLocaleTimeString()}`;
      });
    });
  };

  const modifyCount = (storageKey, increment) => {
    chrome.storage.local.get([storageKey], (result) => {
      const storedData = result[storageKey] || { count: 0, startDate: new Date().getTime() };

      if (increment || storedData.count > 0) {
        storedData.count += increment ? 1 : -1;
        chrome.storage.local.set({ [storageKey]: storedData }, updateCounts);
      }
    });
  };

  document.querySelectorAll(".button").forEach((button) => {
    button.addEventListener("click", () => {
      const storageKey = button.getAttribute("data-key");
      const increment = button.getAttribute("data-increment") === "true";

      if (confirm(`Are you sure you want to ${increment ? "increment" : "decrement"} the count?`)) {
        modifyCount(storageKey, increment);
      }
    });
  });

  document.querySelectorAll(".edit-date").forEach((editDate) => {
    editDate.addEventListener("click", () => {
      currentEditKey = editDate.getAttribute("data-key");
      editDateModal.style.display = "block";
    });
  });

  closeModalButton.addEventListener("click", () => {
    editDateModal.style.display = "none";
  });

  saveDateButton.addEventListener("click", () => {
    const newStartDate = new Date(document.getElementById("newStartDate").value).getTime();

    if (currentEditKey && newStartDate) {
      chrome.storage.local.get([currentEditKey], (result) => {
        const storedData = result[currentEditKey] || { count: 0, startDate: new Date().getTime() };
        storedData.startDate = newStartDate;
        chrome.storage.local.set({ [currentEditKey]: storedData }, () => {
          editDateModal.style.display = "none";
          updateCounts();
        });
      });
    }
  });

  window.onclick = (event) => {
    if (event.target == editDateModal) {
      editDateModal.style.display = "none";
    }
  };

  updateCounts();
});

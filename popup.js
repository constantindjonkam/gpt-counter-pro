document.addEventListener("DOMContentLoaded", () => {
  const o1PreviewStorageKey = "o1PreviewRequestData";
  const gpt4oStorageKey = "gpt4oRequestData";

  const models = [
    ["o1Preview", { storageKey: o1PreviewStorageKey, resetIntervalHours: 24 * 7 }],
    ["gpt4o", { storageKey: gpt4oStorageKey, resetIntervalHours: 3 }],
  ];
  const modelsMap = new Map(models);
  const modelStorageKeys = Array.from(modelsMap.values()).map((model) => model.storageKey);

  const editDateModal = document.getElementById("editDateModal");
  const closeModalButton = document.querySelector(".close");
  const saveDateButton = document.getElementById("saveDateButton");
  let currentEditKey = null;

  // when the popup opens check if any model startDate has already passed and reset the count and set date to N/A
  chrome.storage.sync.get(modelStorageKeys, (result) => {
    modelsMap.forEach((model, key) => {
      const modelData = result[model.storageKey] || { count: 0, startDate: new Date().getTime() };
      const resetDate = new Date(modelData.startDate);
      resetDate.setHours(resetDate.getHours() + model.resetIntervalHours);

      if (resetDate < new Date()) {
        setTimeout(() => {
          document.getElementById(`${key}Count`).textContent = 0;
          document.getElementById(`${key}Reset`).textContent = `Resets: N/A`;
        }, 100);
        chrome.storage.sync.set({ [model.storageKey]: { count: 0, startDate: null } });
      }
    });
  });

  const updateCounts = () => {
    chrome.storage.sync.get(modelStorageKeys, (result) => {
      modelsMap.forEach((model, key) => {
        const modelData = result[model.storageKey] || { count: 0, startDate: new Date().getTime() };
        document.getElementById(`${key}Count`).textContent = modelData.count;

        const resetDate = new Date(modelData.startDate);
        resetDate.setHours(resetDate.getHours() + model.resetIntervalHours);
        const veryOldDate = new Date("1970-01-01T00:00:00");

        if (resetDate < veryOldDate) {
          return (document.getElementById(`${key}Reset`).textContent = `Resets: N/A`);
        }

        document.getElementById(
          `${key}Reset`
        ).textContent = `Resets: ${resetDate.toLocaleDateString()} ${resetDate.toLocaleTimeString()}`;
      });
    });
  };

  const modifyCount = (storageKey, increment) => {
    chrome.storage.sync.get([storageKey], (result) => {
      const storedData = result[storageKey] || { count: 0, startDate: new Date().getTime() };

      if (increment || storedData.count > 0) {
        storedData.count += increment ? 1 : -1;
        chrome.storage.sync.set({ [storageKey]: storedData }, updateCounts);
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
      chrome.storage.sync.get([currentEditKey], (result) => {
        const storedData = result[currentEditKey] || { count: 0, startDate: new Date().getTime() };
        storedData.startDate = newStartDate;
        chrome.storage.sync.set({ [currentEditKey]: storedData }, () => {
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

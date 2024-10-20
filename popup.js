document.addEventListener("DOMContentLoaded", () => {
  const o1PreviewStorageKey = "o1PreviewRequestData";
  const gpt4oStorageKey = "gpt4oRequestData";

  const editDateModal = document.getElementById("editDateModal");
  const closeModalButton = document.querySelector(".close");
  const saveDateButton = document.getElementById("saveDateButton");
  let currentEditKey = null;

  const updateCounts = () => {
    chrome.storage.local.get([o1PreviewStorageKey, gpt4oStorageKey], (result) => {
      const o1PreviewData = result[o1PreviewStorageKey] || {
        count: 0,
        startDate: new Date().getTime(),
      };
      const gpt4oData = result[gpt4oStorageKey] || { count: 0, startDate: new Date().getTime() };

      document.getElementById("o1PreviewCount").textContent = o1PreviewData.count;
      document.getElementById("gpt4oCount").textContent = gpt4oData.count;

      const o1PreviewResetDate = new Date(o1PreviewData.startDate);
      const gpt4oResetDate = new Date(gpt4oData.startDate);

      document.getElementById(
        "o1PreviewReset"
      ).textContent = `Resets: ${o1PreviewResetDate.toLocaleDateString()} ${o1PreviewResetDate.toLocaleTimeString()}`;
      document.getElementById(
        "gpt4oReset"
      ).textContent = `Resets: ${gpt4oResetDate.toLocaleDateString()} ${gpt4oResetDate.toLocaleTimeString()}`;
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

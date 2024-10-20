document.addEventListener("DOMContentLoaded", function () {
  const o1PreviewStorageKey = "o1PreviewRequestData";
  const gpt4oStorageKey = "gpt4oRequestData";

  const editDateModal = document.getElementById("editDateModal");
  const closeModalButton = document.querySelector(".close");
  const saveDateButton = document.getElementById("saveDateButton");
  let currentEditKey = null;

  function updateCounts() {
    chrome.storage.local.get([o1PreviewStorageKey, gpt4oStorageKey], function (result) {
      const o1PreviewData = result[o1PreviewStorageKey] || {
        count: 0,
        startDate: new Date().getTime(),
      };
      const gpt4oData = result[gpt4oStorageKey] || { count: 0, startDate: new Date().getTime() };

      document.getElementById("o1PreviewCount").textContent = o1PreviewData.count;
      document.getElementById("gpt4oCount").textContent = gpt4oData.count;

      const o1PreviewResetDate = new Date(o1PreviewData.startDate + 24 * 7 * 60 * 60 * 1000);
      const gpt4oResetDate = new Date(gpt4oData.startDate + 3 * 60 * 60 * 1000);

      document.getElementById(
        "o1PreviewReset"
      ).textContent = `Resets: ${o1PreviewResetDate.toLocaleDateString()} ${o1PreviewResetDate.toLocaleTimeString()}`;
      document.getElementById(
        "gpt4oReset"
      ).textContent = `Resets: ${gpt4oResetDate.toLocaleDateString()} ${gpt4oResetDate.toLocaleTimeString()}`;
    });
  }

  function modifyCount(storageKey, increment) {
    chrome.storage.local.get([storageKey], function (result) {
      const storedData = result[storageKey] || { count: 0, startDate: new Date().getTime() };
      if (increment || storedData.count > 0) {
        storedData.count += increment ? 1 : -1;
        chrome.storage.local.set({ [storageKey]: storedData }, updateCounts);
      }
    });
  }

  document.querySelectorAll(".button").forEach((button) => {
    button.addEventListener("click", function () {
      const storageKey = this.getAttribute("data-key");
      const increment = this.getAttribute("data-increment") === "true";
      if (confirm(`Are you sure you want to ${increment ? "increment" : "decrement"} the count?`)) {
        modifyCount(storageKey, increment);
      }
    });
  });

  document.querySelectorAll(".edit-date").forEach((editDate) => {
    editDate.addEventListener("click", function () {
      currentEditKey = this.getAttribute("data-key");
      editDateModal.style.display = "block";
    });
  });

  closeModalButton.addEventListener("click", function () {
    editDateModal.style.display = "none";
  });

  saveDateButton.addEventListener("click", function () {
    // const newStartDate = new Date(document.getElementById("newStartDate").value).getTime();
    const newStartDate = new Date(document.getElementById("newStartDate").value).toISOString();

    if (currentEditKey && newStartDate) {
      chrome.storage.local.get([currentEditKey], function (result) {
        const storedData = result[currentEditKey] || { count: 0, startDate: new Date().getTime() };
        storedData.startDate = newStartDate;
        chrome.storage.local.set({ [currentEditKey]: storedData }, function () {
          editDateModal.style.display = "none";
          updateCounts();
        });
      });
    }
  });

  window.onclick = function (event) {
    if (event.target == editDateModal) {
      editDateModal.style.display = "none";
    }
  };

  updateCounts();
});

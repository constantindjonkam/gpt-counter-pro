const o1PreviewStorageKey = "o1PreviewRequestData";
const gpt4oStorageKey = "gpt4oRequestData";

// no more needed
// function loadInitialData(storageKey, initialCount, initialDate) {
//   chrome.storage.local.get([storageKey], function (result) {
//     if (!result[storageKey]) {
//       const initialData = {
//         count: initialCount,
//         startDate: new Date(initialDate).getTime(),
//       };
//       chrome.storage.local.set({ [storageKey]: initialData });
//     }
//   });
// }

function updateRequestCount(storageKey, resetIntervalHours) {
  chrome.storage.local.get([storageKey], function (result) {
    const storedData = result[storageKey] || { count: 0, startDate: new Date().getTime() };
    const currentDate = new Date().getTime();
    const hoursSinceFirstRequest = (currentDate - storedData.startDate) / (1000 * 60 * 60);

    if (hoursSinceFirstRequest >= resetIntervalHours) {
      storedData.count = 1;
      storedData.startDate = currentDate;
    } else {
      storedData.count += 1;
    }

    chrome.storage.local.set({ [storageKey]: storedData });
  });
}

// loadInitialData(o1PreviewStorageKey, 5, "2024-10-18T13:00:00");
// loadInitialData(gpt4oStorageKey, 10, "2024-10-19T23:00:00");

chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    if (
      details.url === "https://chatgpt.com/backend-api/conversation" &&
      details.method === "POST" &&
      details?.requestBody?.raw?.length > 0
    ) {
      try {
        const requestBody = JSON.parse(new TextDecoder().decode(details.requestBody.raw[0].bytes));
        if (requestBody.model) {
          if (requestBody.model.includes("o1-preview")) {
            updateRequestCount(o1PreviewStorageKey, 24 * 7);
          }
          if (requestBody.model.includes("gpt-4o")) {
            updateRequestCount(gpt4oStorageKey, 3);
          }
        }
      } catch (e) {
        console.error("Failed to parse request body:", e);
      }
    }
  },
  { urls: ["https://chatgpt.com/backend-api/conversation"] },
  ["requestBody"]
);

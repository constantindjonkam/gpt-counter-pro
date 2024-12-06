const o1StorageKey = "o1RequestData";
const gpt4oStorageKey = "gpt4oRequestData";
const o1MiniStorageKey = "o1MiniRequestData";
const models = [
  { name: "o1", storageKey: o1StorageKey, resetIntervalHours: 24 * 7 },
  { name: "gpt-4o", storageKey: gpt4oStorageKey, resetIntervalHours: 3 },
  { name: "o1-mini", storageKey: o1MiniStorageKey, resetIntervalHours: 24 },
];

const updateRequestCount = (storageKey, resetIntervalHours) => {
  chrome.storage.sync.get([storageKey], (result) => {
    const storedData = result[storageKey] || { count: 0, startDate: new Date().getTime() };
    const currentDate = new Date().getTime();
    const hoursSinceFirstRequest = (currentDate - storedData.startDate) / (1000 * 60 * 60);

    if (hoursSinceFirstRequest >= resetIntervalHours) {
      storedData.count = 1;
      storedData.startDate = currentDate;
    } else {
      storedData.count += 1;
    }

    chrome.storage.sync.set({ [storageKey]: storedData });
  });
};

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (
      details.url === "https://chatgpt.com/backend-api/conversation" &&
      details.method === "POST" &&
      details?.requestBody?.raw?.length > 0
    ) {
      try {
        const requestBody = JSON.parse(new TextDecoder().decode(details.requestBody.raw[0].bytes));
        if (requestBody.model) {
          models.forEach((model) => {
            if (requestBody.model.includes(model.name)) {
              updateRequestCount(model.storageKey, model.resetIntervalHours);
            }
          });
        }
      } catch (e) {
        console.error("Failed to parse request body:", e);
      }
    }
  },
  { urls: ["https://chatgpt.com/backend-api/conversation"] },
  ["requestBody"]
);

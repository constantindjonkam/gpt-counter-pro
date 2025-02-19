const o1StorageKey = "o1RequestData";
const o3MiniHighStorageKey = "o3MiniHighRequestData";
const gpt4oStorageKey = "gpt4oRequestData";
const o3MiniStorageKey = "o3MiniRequestData";
const models = [
  { name: "o1", storageKey: o1StorageKey, resetIntervalHours: 24 * 7 },
  { name: "o3-mini-high", storageKey: o3MiniHighStorageKey, resetIntervalHours: 24 },
  { name: "gpt-4o", storageKey: gpt4oStorageKey, resetIntervalHours: 3 },
  { name: "o3-mini", storageKey: o3MiniStorageKey, resetIntervalHours: 24 },
];

// get the current date rounded to the nearest minute
const getRoundedDate = () => {
  const now = new Date();
  now.setSeconds(0, 0);

  return now.getTime();
};

const updateRequestCount = (storageKey, resetIntervalHours) => {
  chrome.storage.sync.get([storageKey], (result) => {
    const storedData = result[storageKey] || { count: 0, startDate: getRoundedDate() };
    const currentDate = getRoundedDate();
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
            if (requestBody.model == model.name) {
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

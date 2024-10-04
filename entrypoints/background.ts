export default defineBackground({
  main() {
    console.log("Background script initialized");

    // Initialize language difficulty
    browser.storage.local.get(["languageDifficulty"]).then((result) => {
      if (result.languageDifficulty === undefined) {
        browser.storage.local.set({ languageDifficulty: 0 });
        console.log("Initialized language difficulty to 0");
      } else {
        console.log("Loaded language difficulty:", result.languageDifficulty);
      }
    });

    // Listen for changes to language difficulty
    browser.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === "local" && changes.languageDifficulty) {
        console.log(
          "Language difficulty changed:",
          changes.languageDifficulty.newValue
        );
        updateAllTabs(changes.languageDifficulty.newValue);
      }
    });

    browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      console.log("Tab updated:", { tabId, changeInfo, tabUrl: tab.url });
      if (changeInfo.status === "complete" && tab.url) {
        browser.storage.local.get(["languageDifficulty"]).then((result) => {
          const difficulty = result.languageDifficulty || 0;
          sendMessageToTab(tabId, difficulty);
        });
      }
    });

    browser.runtime.onMessage.addListener((message, sender) => {
      if (message.type === "DIFFICULTY_CHANGED") {
        updateAllTabs(message.difficulty);
      }
    });

    function updateAllTabs(difficulty: number) {
      browser.tabs.query({}).then((tabs) => {
        for (let tab of tabs) {
          if (tab.id) {
            sendMessageToTab(tab.id, difficulty);
          }
        }
      });
    }

    function sendMessageToTab(tabId: number, difficulty: number) {
      browser.tabs
        .sendMessage(tabId, { type: "ANALYZE_PAGE", difficulty })
        .then((response) => {
          console.log(
            "Message sent successfully to tab",
            tabId,
            "response:",
            response
          );
        })
        .catch((error) => {
          console.error("Error sending message to tab", tabId, ":", error);
        });
    }
  },
});

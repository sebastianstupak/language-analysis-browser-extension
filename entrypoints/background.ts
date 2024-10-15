import "webext-bridge/background";
import { onMessage } from "webext-bridge/background";

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(async ({ reason }) => {
    if (reason !== "install") {
      return;
    }
    await browser.tabs.create({
      url: browser.runtime.getURL("/get-started.html" as any),
      active: true,
    });
  });

  onMessage("DIFFICULTY_CHANGED", async (message) => {
    console.log('Received difficulty:', message.data.difficulty);
    return false;
  });
});
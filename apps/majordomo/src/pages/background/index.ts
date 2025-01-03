import { ExtensionState } from "@src/lib/interface/state";

import { clearState, loadState, saveState } from "./state";

console.log("background script loaded");

async function screenshot() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab.id) {
      return;
    }

    await chrome.tabs.update(tab.id, { active: true });
    const screenshot = await chrome.tabs.captureVisibleTab();

    return { screenshot };
  } catch (error) {
    console.error("captureActiveTab:", error);
  }
}

async function navigate({ url }: { url: string }) {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  if (!tab.id) {
    return;
  }

  await chrome.tabs.update(tab.id, { url });
}

async function refresh() {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  if (!tab.id) return;

  await chrome.tabs.reload(tab.id);
}

async function back() {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  if (!tab.id) return;

  await chrome.tabs.goBack(tab.id);
}

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.action === "screenshot") {
    screenshot().then((res) => {
      sendResponse({ ok: res ? true : false, screenshot: res?.screenshot });
    });

    return true;
  }
});

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.action === "navigate") {
    navigate({ url: message.url as string }).then(() => {
      sendResponse({ ok: true });
    });
  }

  return true;
});

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.action === "refresh") {
    refresh().then(() => {
      sendResponse({ ok: true });
    });

    return true;
  }
});

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.action === "back") {
    back().then(() => {
      sendResponse({ ok: true });
    });

    return true;
  }
});

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.action === "load_state") {
    loadState().then((extensionState) => {
      sendResponse(extensionState);
    });
  }

  return true;
});

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.action === "save_state") {
    saveState(message.state as ExtensionState).then(() => {
      sendResponse({ ok: true });
    });
  }

  return true;
});

chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.action === "clear_state") {
    clearState().then(() => {
      sendResponse({ ok: true });
    });
  }

  return true;
});

console.log("listeners initialized");

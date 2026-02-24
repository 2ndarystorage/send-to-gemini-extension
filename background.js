// コンテキストメニューの作成
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "sendToGemini",
    title: "Geminiに送る: \"%s\"",
    contexts: ["selection"]
  });
});

// コンテキストメニューのクリックイベント
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "sendToGemini" && info.selectionText) {
    const selectedText = info.selectionText.trim();

    // 選択テキストをストレージに保存
    chrome.storage.local.set({ pendingText: selectedText }, () => {
      // Geminiを新しいタブで開く
      chrome.tabs.create(
        { url: "https://gemini.google.com/app" },
        (newTab) => {
          // タブが読み込まれたらコンテンツスクリプトに通知
          chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
            if (tabId === newTab.id && changeInfo.status === "complete") {
              chrome.tabs.onUpdated.removeListener(listener);
              chrome.tabs.sendMessage(tabId, { action: "insertText" });
            }
          });
        }
      );
    });
  }
});

// Geminiの入力フィールドを取得する関数
function getGeminiInput() {
  const selectors = [
    "rich-textarea .ql-editor",
    "rich-textarea [contenteditable]",
    "[contenteditable='true'][aria-label]",
    "textarea[placeholder]",
    "[contenteditable='true']",
    "textarea"
  ];

  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el) return el;
  }
  return null;
}

// テキストを入力フィールドに挿入する関数
function insertTextToInput(text) {
  const input = getGeminiInput();
  if (!input) return false;

  input.focus();

  if (input.isContentEditable) {
    // contenteditable 要素の場合
    // 既存のプレースホルダーをクリア
    input.innerHTML = "";
    // execCommand でテキストを挿入（Reactなどのフレームワークにも対応）
    document.execCommand("insertText", false, text);

    // フォールバック: execCommand が効かない場合
    if (!input.textContent.includes(text)) {
      input.textContent = text;
      input.dispatchEvent(new InputEvent("input", { bubbles: true, data: text }));
    }
  } else {
    // textarea / input 要素の場合
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value"
    )?.set;
    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(input, text);
    } else {
      input.value = text;
    }
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  // カーソルを末尾に移動
  if (input.isContentEditable) {
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(input);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  return true;
}

// バックグラウンドからのメッセージを受信
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "insertText") {
    chrome.storage.local.get(["pendingText"], (result) => {
      if (result.pendingText) {
        const text = result.pendingText;
        chrome.storage.local.remove("pendingText");

        // 入力フィールドが表示されるまで待機（最大10秒）
        let attempts = 0;
        const maxAttempts = 20;
        const interval = setInterval(() => {
          attempts++;
          const success = insertTextToInput(text);

          if (success) {
            clearInterval(interval);
            sendResponse({ success: true });
          } else if (attempts >= maxAttempts) {
            clearInterval(interval);
            console.warn("[Send to Gemini] 入力フィールドが見つかりませんでした。");
            sendResponse({ success: false });
          }
        }, 500);
      }
    });

    // 非同期レスポンスのためtrueを返す
    return true;
  }
});

// ページ読み込み時にも未処理のテキストを確認
window.addEventListener("load", () => {
  chrome.storage.local.get(["pendingText"], (result) => {
    if (result.pendingText) {
      const text = result.pendingText;
      chrome.storage.local.remove("pendingText");

      let attempts = 0;
      const maxAttempts = 20;
      const interval = setInterval(() => {
        attempts++;
        const success = insertTextToInput(text);

        if (success) {
          clearInterval(interval);
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          console.warn("[Send to Gemini] 入力フィールドが見つかりませんでした。");
        }
      }, 500);
    }
  });
});

## Program Summary
- Chrome extension that adds a context-menu item to send selected text to Gemini.
- Opens `https://gemini.google.com/app` in a new tab and injects the selected text into Gemini's input field.

## How to Use
- Not verified: Load the extension in Chrome (likely via Load unpacked).
- Select text on any page, right-click, and choose the "Geminiに送る" context-menu item.
- A Gemini tab opens and the text is inserted into the prompt box.

## Completion Status
- Usable (basic): core flow works (context menu, open Gemini, insert text), but there are no settings or UI/error feedback beyond console warnings.

## Program Summary
- Chrome extension that adds a selection-only context menu to send highlighted text to Gemini.
- Saves the text in `chrome.storage.local`, opens `https://gemini.google.com/app`, and injects the text into the prompt field with retries.

## How to Use
- Not verified: Load the unpacked extension in Chrome.
- Select text on any page, right-click, and choose the "Geminiに送る" menu item.
- A Gemini tab opens and the text is inserted into the prompt box.

## Completion Status
- Usable (basic): core flow is implemented (context menu, storage handoff, Gemini tab, text insertion), but there are no settings, UI controls, or robust error handling.

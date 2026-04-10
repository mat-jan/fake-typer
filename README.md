# ai_write_extesion

VS Code extension that lets you ask AI for Arduino code directly from the editor.

## Features

- Command: `AI: Ask For Arduino Code`
- Prompts you for a request in VS Code
- Calls AI chat API and opens result in a new `.cpp` editor tab
- Also prints prompt/response to output channel `AI Arduino Helper`

## Setup

1. Open this repository in VS Code.
2. Run:

```bash
npm install
```

3. Press `F5` to start Extension Development Host.
4. In the new window, open Settings and set:

- `aiWriteExtension.openAIApiKey` (required)
- `aiWriteExtension.model` (default: `gpt-4.1-mini`)
- `aiWriteExtension.systemPrompt` (optional)

## Usage

1. Open Command Palette.
2. Run `AI: Ask For Arduino Code`.
3. Describe what you want, for example:

`Create Arduino UNO code for blinking LED on pin 13 every 500 ms.`

The AI response opens in a new editor with C++ language mode.

## Notes

- This extension calls the API directly from your local VS Code session.
- Keep your API key private.
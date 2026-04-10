const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  const output = vscode.window.createOutputChannel('AI Arduino Helper');

  const disposable = vscode.commands.registerCommand('aiWriteExtension.askArduinoAI', async () => {
    try {
      const config = vscode.workspace.getConfiguration('aiWriteExtension');
      const apiKey = String(config.get('openAIApiKey') || '').trim();
      const model = String(config.get('model') || 'gpt-4.1-mini').trim();
      const systemPrompt = String(
        config.get('systemPrompt') ||
          'You are an Arduino expert. Return practical, compilable Arduino code with short explanation.'
      );

      if (!apiKey) {
        const picked = await vscode.window.showWarningMessage(
          'Set aiWriteExtension.openAIApiKey in Settings first.',
          'Open Settings'
        );
        if (picked === 'Open Settings') {
          await vscode.commands.executeCommand(
            'workbench.action.openSettings',
            'aiWriteExtension.openAIApiKey'
          );
        }
        return;
      }

      const userPrompt = await vscode.window.showInputBox({
        title: 'Ask AI for Arduino code',
        prompt: 'Describe what you want to build',
        placeHolder: 'Example: Create ESP32 code for DHT22 and OLED display',
        ignoreFocusOut: true
      });

      if (!userPrompt || !userPrompt.trim()) {
        return;
      }

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Generating Arduino code from AI...',
          cancellable: false
        },
        async () => {
          const aiText = await askOpenAI({ apiKey, model, systemPrompt, userPrompt: userPrompt.trim() });

          output.clear();
          output.appendLine('Prompt:');
          output.appendLine(userPrompt.trim());
          output.appendLine('');
          output.appendLine('Response:');
          output.appendLine(aiText);
          output.show(true);

          const doc = await vscode.workspace.openTextDocument({
            language: 'cpp',
            content: aiText
          });
          await vscode.window.showTextDocument(doc, { preview: false });
        }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      vscode.window.showErrorMessage(`AI request failed: ${message}`);
    }
  });

  context.subscriptions.push(disposable, output);
}

async function askOpenAI({ apiKey, model, systemPrompt, userPrompt }) {
  const body = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.2
  };

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const raw = await response.text();
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${raw}`);
  }

  /** @type {{choices?: Array<{message?: {content?: string}}>}} */
  const data = JSON.parse(raw);
  const text = data?.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error('Empty model response.');
  }

  return text;
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};

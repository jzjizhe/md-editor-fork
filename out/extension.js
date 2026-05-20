"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const markdownEditorProvider_1 = require("./provider/markdownEditorProvider");
function activate(context) {
    console.log("init md-editor success");
    // Register theme switch command
    const switchThemeCmd = vscode.commands.registerCommand('md-editor.switchTheme', async () => {
        const themes = [
            { label: '$(paintcan) GitHub', description: 'Clean and familiar', value: 'github' },
            { label: '$(book) Typora Clean', description: 'Minimal and elegant', value: 'typora-clean' },
            { label: '$(heart) Claude-Like', description: 'Warm and readable', value: 'claude-like' },
            { label: '$(circle-slash) None', description: 'No built-in theme (use customCss only)', value: 'none' }
        ];
        const picked = await vscode.window.showQuickPick(themes, {
            placeHolder: 'Select a theme for Md Editor'
        });
        if (picked) {
            const config = vscode.workspace.getConfiguration('md-editor');
            await config.update('theme', picked.value, vscode.ConfigurationTarget.Global);
            const reload = await vscode.window.showInformationMessage(
                `Theme switched to "${picked.label.replace(/\$\([^)]+\)\s*/, '')}". Reopen the file to apply.`,
                'Reopen'
            );
            if (reload) {
                await vscode.commands.executeCommand('workbench.action.reopenTextEditor');
            }
        }
    });
    context.subscriptions.push(
    switchThemeCmd,
    vscode.window.registerCustomEditorProvider("seepine.md-editor", new markdownEditorProvider_1.MarkdownEditorProvider(context), {
        webviewOptions: {
            retainContextWhenHidden: true, // 保留隐藏的Webview上下文
        },
    }));
}
exports.activate = activate;
// This method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map
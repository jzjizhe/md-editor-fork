"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const markdownEditorProvider_1 = require("./provider/markdownEditorProvider");
function activate(context) {
    console.log("init md-editor success");
    // let disposable = vscode.commands.registerCommand(
    //   "md-editor.helloWorld",
    //   () => {
    //     vscode.window.showInformationMessage("Hello World from md-editor!");
    //   }
    // );
    context.subscriptions.push(
    // disposable,
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
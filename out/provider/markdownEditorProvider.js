"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkdownEditorProvider = void 0;
const fs_1 = require("fs");
const path = require("path");
const vscode = require("vscode");
const handler_1 = require("../common/handler");
const fileUtil_1 = require("../common/fileUtil");
const path_1 = require("path");
const buildPath = (data, webview, contextPath) => {
    return data
        .replace(/((src|href)=("|')?)(\/\/)/gi, "$1http://")
        .replace(/((src|href)=("|'))((?!(http|#)).+?["'])/gi, "$1" + webview.asWebviewUri(vscode.Uri.file(`${contextPath}`)) + "/$4");
};
class MarkdownEditorProvider {
    constructor(ctx) {
        this.ctx = ctx;
        this.text = {};
        this.context = ctx;
        this.state = ctx.globalState;
    }
    getFolders() {
        const data = [];
        for (var i = 65; i <= 90; i++) {
            data.push(vscode.Uri.file(`${String.fromCharCode(i)}:/`));
        }
        return data;
    }
    resolveCustomTextEditor(document, webviewPanel, token) {
        const webview = webviewPanel.webview;
        const folderPath = vscode.Uri.joinPath(document.uri, "..");
        webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file("/"), ...this.getFolders()],
        };
        this.text[document.uri.fsPath] = document.getText();
        const contextPath = `${this.context.extensionPath}/render`;
        const rootPath = webview
            .asWebviewUri(vscode.Uri.file(`${contextPath}`))
            .toString();
        const basePath = folderPath;
        const baseUrl = webview
            .asWebviewUri(basePath)
            .toString()
            .replace(/\?.+$/, "")
            .replace("https://git", "https://file");
        const config = vscode.workspace.getConfiguration('md-editor');
        const themeName = config.get('theme', 'github');
        const customCss = config.get('customCss', '');
        const useVscodeThemeColor = config.get('useVscodeThemeColor', false);
        let htmlContent = (0, fs_1.readFileSync)(`${this.context.extensionPath}/render/index.html`, "utf8")
            .replace("{{rootPath}}", rootPath)
            .replace("{{baseUrl}}", baseUrl);
        // Inject theme CSS before </head>
        if (themeName && themeName !== 'none') {
            const themePath = `${this.context.extensionPath}/render/themes/${themeName}.css`;
            try {
                const themeCss = (0, fs_1.readFileSync)(themePath, "utf8");
                htmlContent = htmlContent.replace('</head>', `<style id="md-editor-theme">${themeCss}</style>\n</head>`);
            } catch (e) {
                // Theme file not found, skip
            }
        }
        // Inject custom CSS after theme (higher priority)
        if (customCss) {
            htmlContent = htmlContent.replace('</head>', `<style id="md-editor-custom">${customCss}</style>\n</head>`);
        }
        // Inject vscode theme color CSS
        if (useVscodeThemeColor) {
            const themeColorCss = `body { --panel-background-color: var(--vscode-editor-background); --toolbar-background-color: var(--vscode-editor-background); --textarea-background-color: var(--vscode-editor-background); }`;
            htmlContent = htmlContent.replace('</head>', `<style>${themeColorCss}</style>\n</head>`);
        }
        webview.html = buildPath(htmlContent, webview, contextPath);
        const handler = handler_1.Hanlder.bind(webviewPanel, document.uri);
        handler.on("init", () => {
            const scrollTop = this.state.get(`scrollTop_${document.uri.fsPath}`, 0);
            handler.emit("open", {
                title: (0, path_1.basename)(document.uri.fsPath),
                language: vscode.env.language,
                scrollTop,
                rootPath,
                content: this.text[document.uri.fsPath],
            });
        });
        handler.on("change", (content) => {
            this.updateTextDocument(document, content);
        });
        // 监听文件变化自动更新
        const saveListener = vscode.workspace.onDidSaveTextDocument((doc) => {
            const val = doc.getText();
            if (doc.uri.fsPath === document.uri.fsPath &&
                this.text[document.uri.fsPath] !== val) {
                this.text[document.uri.fsPath] = val;
                handler.emit("setValue", val);
            }
        });
        // 监听文档内容变化（外部修改时自动刷新）
        const changeListener = vscode.workspace.onDidChangeTextDocument((e) => {
            if (e.document.uri.fsPath === document.uri.fsPath &&
                e.contentChanges.length > 0) {
                const val = e.document.getText();
                if (this.text[document.uri.fsPath] !== val) {
                    this.text[document.uri.fsPath] = val;
                    handler.emit("setValue", val);
                }
            }
        });
        webviewPanel.onDidDispose(() => {
            saveListener.dispose();
            changeListener.dispose();
        });
        this.handleEvent(document, handler);
    }
    handleEvent(document, handler) {
        handler
            .on("openLink", (uri) => {
            const resReg = /https:\/\/file.*\.net/i;
            if (uri.match(resReg)) {
                const localPath = uri.replace(resReg, "");
                vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(localPath));
            }
            else {
                vscode.env.openExternal(vscode.Uri.parse(uri));
            }
        })
            .on("img", (img) => {
            const { relPath, fullPath } = (0, fileUtil_1.adjustImgPath)(document.uri);
            const imagePath = path.isAbsolute(fullPath)
                ? fullPath
                : `${(0, path_1.resolve)(document.uri.fsPath, "..")}/${relPath}`.replace(/\\/g, "/");
            (0, fileUtil_1.wrieteFile)(imagePath, Buffer.from(img, "binary"));
            const fileName = (0, path_1.parse)(relPath).name;
            handler.emit("insertValue", `![${fileName}](${relPath})`);
        })
            .on("scroll", ({ scrollTop }) => {
            this.state.update(`scrollTop_${document.uri.fsPath}`, scrollTop);
        })
            .on("editInVSCode", (full) => {
            vscode.commands.executeCommand("vscode.openWith", document.uri, "default", vscode.ViewColumn.Active);
        })
            .on("reload", () => {
            handler.emit("setValue", document.getText());
        });
    }
    updateTextDocument(document, content) {
        const edit = new vscode.WorkspaceEdit();
        edit.replace(document.uri, new vscode.Range(0, 0, document.lineCount, 0), content);
        this.text[document.uri.fsPath] = content;
        return vscode.workspace.applyEdit(edit);
    }
}
exports.MarkdownEditorProvider = MarkdownEditorProvider;
//# sourceMappingURL=markdownEditorProvider.js.map
# md-editor-fork

A fork of [seepine.md-editor](https://marketplace.visualstudio.com/items?itemName=seepine.md-editor) with **theme switching** and **custom CSS** support.

## Features

- All original features: instant rendering, split preview, WYSIWYG editing (Typora-like experience)
- **Built-in themes**: GitHub, Typora Clean, Claude-Like, VS Code, Vditor Light
- **Theme switching command**: `Cmd+Shift+P` → `Md Editor: Switch Theme`
- **Custom CSS injection**: fine-tune styles via `md-editor.customCss` setting
- **Auto-refresh on external file changes**: works seamlessly with CLI tools (e.g. Claude Code)

## Installation

### Download and Install

1. Go to [Releases](https://github.com/jzjizhe/md-editor-fork/releases) page, or build from source (see below).
2. Download the `.vsix` file.
3. Install in VS Code:
   - Open VS Code
   - `Cmd+Shift+P` (or `Ctrl+Shift+P`) → `Extensions: Install from VSIX...`
   - Select the downloaded `.vsix` file

### Build from Source

```bash
git clone https://github.com/jzjizhe/md-editor-fork.git
cd md-editor-fork
npx @vscode/vsce package --no-dependencies -o md-editor-custom.vsix
code --install-extension md-editor-custom.vsix --force
```

## Configuration

Add to your VS Code `settings.json`:

```json
{
  "workbench.editorAssociations": {
    "*.md": "seepine.md-editor"
  },
  "md-editor.theme": "github",
  "md-editor.customCss": "",
  "md-editor.useVscodeThemeColor": false
}
```

### Available Themes

| Theme | Description |
|-------|-------------|
| `github` | GitHub style - clean and familiar |
| `typora-clean` | Minimal and elegant |
| `claude-like` | Warm and readable, serif font |
| `vscode` | Matches VS Code's built-in Markdown preview |
| `vditor-light` | The original Vditor default theme |
| `none` | No built-in theme (use `customCss` only) |

### Custom CSS

You can add additional CSS overrides on top of any theme:

```json
{
  "md-editor.customCss": ".vditor-reset { font-size: 18px !important; }"
}
```

## Differences from Original

- Added `md-editor.theme` setting with 5 built-in themes
- Added `md-editor.customCss` setting for custom style injection
- Added `md-editor.useVscodeThemeColor` setting
- Added `Md Editor: Switch Theme` command
- Added `onDidChangeTextDocument` listener for auto-refresh on external file modifications

## Credits

- Original extension: [seepine/md-editor](https://github.com/nicepkg/vscode-md-editor) by seepine
- Editor engine: [Vditor](https://github.com/Vanessa219/vditor) by B3log

## License

MIT

import { imageParser, scrollEditor, openLink } from "./js/util.js";
import { toolbar } from "./js/toolbar.js";
const init = () => {
  window.handler
    .on("open", ({ title, content, language, scrollTop, rootPath }) => {
      const isDark = window.localStorage.getItem("dark") !== "false";
      const editMode = window.localStorage.getItem("edit-mode") || "ir";
      // 是否显示大纲
      const showOutline = window.localStorage.getItem("outline") === 'true';

      let lastKeydown = "";
      const vditor = new Vditor("vditor", {
        value: content,
        toolbar,
        cdn: `${rootPath}/cdn/vditor`,
        height: "100%",
        lang: language === "zh-cn" ? "zh_CN" : "en_US",
        width: "100%",
        cache: {
          enable: false,
        },
        undoDelay: 200,
        icon: "material",
        tab: "  ",
        mode: editMode,
        theme: isDark ? "dark" : "light",
        preview: {
          theme: {
            current: isDark ? "dark" : "light",
            path: `${rootPath}/cdn/vditor/dist/css/content-theme`,
          },
          markdown: {
            toc: true,
            codeBlockPreview: true,
          },
          hljs: {
            lineNumber: true,
            style: isDark ? "github-dark" : "github",
          },
          extPath: rootPath,
          math: {
            engine: "KaTeX",
            inlineDigit: true,
          },
        },
        extPath: rootPath,
        hint: {},
        outline: {
          enable: showOutline
        },
        keydown: (e) => {
          if (!isCompose(e)) {
            return;
          }
          // 修复剪切失效问题
          if (e.code === "KeyX" && lastKeydown === "MetaLeft") {
            setTimeout(() => {
              vditor.deleteValue();
            }, 10);
          }
          lastKeydown = e.code;
        },
        input(content) {
          window.handler.emit("change", content);
        },
        upload: {
          url: "/image",
          accept: "image/*",
          handler(files) {
            let reader = new FileReader();
            reader.readAsBinaryString(files[0]);
            reader.onloadend = () => {
              window.handler.emit("img", reader.result);
            };
          },
        },
        after: () => {
          openLink();
          scrollEditor(scrollTop);
          zoomElement(".vditor-content");
          // vditor create and init thing
          imageParser();
          window.handler.on("insertValue", (val) => {
            vditor.insertValue(val);
          });
          // 外部文件变化时更新内容，保持光标位置
          let pendingValue = null;
          window.handler.on("setValue", (val) => {
            const editorElement = document.querySelector('.vditor-content');
            const hasFocus = editorElement && editorElement.contains(document.activeElement);
            if (hasFocus) {
              // 用户正在编辑，先暂存，等失去焦点时再更新
              pendingValue = val;
            } else {
              vditor.setValue(val);
              pendingValue = null;
            }
          });
          // 失去焦点时应用暂存的内容
          document.addEventListener('focusout', () => {
            if (pendingValue !== null) {
              setTimeout(() => {
                const editorElement = document.querySelector('.vditor-content');
                const stillFocused = editorElement && editorElement.contains(document.activeElement);
                if (!stillFocused && pendingValue !== null) {
                  vditor.setValue(pendingValue);
                  pendingValue = null;
                }
              }, 100);
            }
          });
          // vditor.setTheme('dark', 'dark', 'native');
          // document.querySelector('body').style.backgroundColor='#2f363d';
        },
      });
      window.vditor = vditor;
    })
    .emit("init");
};
init();

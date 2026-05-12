let editor;

function initEditor() {
  require.config({
    paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs' }
  });

  require(['vs/editor/editor.main'], function () {
    monaco.editor.defineTheme('syux-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.foreground': '#d4d4d4',
        'editor.lineHighlightBackground': '#2a2a2a',
        'editor.selectionBackground': '#264f78',
        'editorCursor.foreground': '#aeafad',
        'editorLineNumber.foreground': '#858585',
        'editorLineNumber.activeForeground': '#c6c6c6'
      }
    });

    editor = monaco.editor.create(document.getElementById('editor-container'), {
      value: `#include <iostream>\n\nint main() {\n  std::cout << "Hello, SYUX!" << std::endl;\n  return 0;\n}`,
      language: 'cpp',
      theme: 'syux-dark',
      fontSize: 14,
      fontFamily: 'Cascadia Code, Fira Code, Consolas, monospace',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      padding: { top: 8 },
      renderLineHighlight: 'line',
      cursorBlinking: 'smooth',
      smoothScrolling: true
    });

    window.editorReady = true;
  });
}

function getEditorCode() {
  return editor ? editor.getValue() : '';
}

function setEditorCode(code) {
  if (editor) editor.setValue(code);
}

function setEditorLanguage(lang) {
  if (editor) {
    const model = editor.getModel();
    if (model) {
      monaco.editor.setModelLanguage(model, lang === 'cpp' ? 'cpp' : 'go');
    }
  }
}

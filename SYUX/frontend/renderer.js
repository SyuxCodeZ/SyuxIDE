document.addEventListener('DOMContentLoaded', function () {
  const runBtn = document.getElementById('run-btn');
  const langSelect = document.getElementById('language-select');
  const statusEl = document.getElementById('status');

  initEditor();
  initTerminal();

  window.addEventListener('resize', resizeTerminal);

  langSelect.addEventListener('change', function () {
    setEditorLanguage(this.value);

    if (this.value === 'cpp') {
      setEditorCode(`#include <iostream>\n\nint main() {\n  std::cout << "Hello, SYUX!" << std::endl;\n  return 0;\n}`);
    } else {
      setEditorCode(`package main\n\nimport "fmt"\n\nfunc main() {\n  fmt.Println("Hello, SYUX!")\n}`);
    }
  });

  runBtn.addEventListener('click', handleRun);

  async function handleRun() {
    const code = getEditorCode();
    const language = langSelect.value;
    const input = document.getElementById('input-box').value;

    if (!code.trim()) {
      writeToTerminal('Error: No code to run\r\n', true);
      return;
    }

    runBtn.disabled = true;
    statusEl.textContent = 'Running...';
    clearTerminal();
    writeToTerminal(`[${language.toUpperCase()}] Running...\r\n`);

    try {
      const result = await window.syuxAPI.runCode(code, language, input);

      writeToTerminal('\r\n');

      if (result.success) {
        if (result.output) {
          writeToTerminal(result.output);
        }
        statusEl.textContent = 'Finished';
      } else {
        if (result.output) {
          writeToTerminal(result.output);
        }
        if (result.error) {
          writeToTerminal(result.error, true);
        }
        statusEl.textContent = 'Failed';
      }

      writeToTerminal('\r\n');
    } catch (err) {
      writeToTerminal(`\r\nError: Could not reach backend.\r\nMake sure the Go server is running on port 9090.\r\n`, true);
      writeToTerminal(`Details: ${err.message}\r\n`, true);
      statusEl.textContent = 'Connection Error';
    } finally {
      runBtn.disabled = false;
    }
  }
});

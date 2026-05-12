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
      const res = await fetch('http://127.0.0.1:9090/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, input })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const result = await res.json();

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
      writeToTerminal(`\r\n--- ERROR ---\r\n`, true);
      writeToTerminal(`${err.toString()}\r\n`, true);
      if (!window.syuxAPI) {
        writeToTerminal(`\r\nCause: window.syuxAPI is undefined (preload may have failed)\r\n`, true);
      }
      if (err.message && err.message.includes('ECONNREFUSED')) {
        writeToTerminal(`\r\nThe Go backend is not running on port 9090.\r\n`, true);
        writeToTerminal(`If auto-start failed, run manually: cd backend && go run .\r\n`, true);
      }
      statusEl.textContent = 'Error';
    } finally {
      runBtn.disabled = false;
    }
  }
});

const outputEl = () => document.getElementById('output');

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function initTerminal() {
  const el = outputEl();
  if (el) {
    el.textContent = 'SYUX IDE Terminal v0.1.0\nReady. Write code and click Run.\n\n';
  }
}

function writeToTerminal(text, isError) {
  const el = outputEl();
  if (!el) return;
  const escaped = escapeHtml(text);
  if (isError) {
    el.innerHTML += '<span class="error">' + escaped + '</span>';
  } else {
    el.innerHTML += escaped;
  }
  el.scrollTop = el.scrollHeight;
}

function clearTerminal() {
  const el = outputEl();
  if (el) el.innerHTML = '';
}

function resizeTerminal() {}

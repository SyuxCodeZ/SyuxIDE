let terminal;
let fitAddon;

function initTerminal() {
  try {
    if (typeof Terminal === 'undefined') {
      console.error('xterm.js not loaded');
      return;
    }
    if (typeof FitAddon === 'undefined') {
      console.error('xterm-addon-fit not loaded');
    }

    fitAddon = new FitAddon();

    terminal = new Terminal({
      fontSize: 13,
      fontFamily: 'Cascadia Code, Fira Code, Consolas, monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#aeafad',
        selectionBackground: '#264f78'
      },
      cursorBlink: true,
      cursorStyle: 'block',
      allowTransparency: false,
      scrollback: 10000
    });

    terminal.loadAddon(fitAddon);
    terminal.open(document.getElementById('terminal-container'));
    fitAddon.fit();

    terminal.write('SYUX IDE Terminal v0.1.0\r\n');
    terminal.write('Ready. Write code and click Run.\r\n\r\n');
  } catch (e) {
    console.error('Terminal init failed:', e);
  }
}

function writeToTerminal(text, isError) {
  if (!terminal) return;
  if (isError) {
    terminal.write('\x1b[31m' + text.replace(/\n/g, '\r\n') + '\x1b[0m');
  } else {
    terminal.write(text.replace(/\n/g, '\r\n'));
  }
}

function clearTerminal() {
  if (terminal) terminal.clear();
}

function resizeTerminal() {
  if (fitAddon) fitAddon.fit();
}

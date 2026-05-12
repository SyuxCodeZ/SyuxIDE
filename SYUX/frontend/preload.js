const { contextBridge } = require('electron');
const http = require('http');

contextBridge.exposeInMainWorld('syuxAPI', {
  runCode: (code, language, input) => {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify({ code, language, input });
      const options = {
        hostname: 'localhost',
        port: 9090,
        path: '/run',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      };
      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(new Error('Failed to parse response'));
          }
        });
      });
      req.on('error', reject);
      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('Request timed out'));
      });
      req.write(data);
      req.end();
    });
  }
});

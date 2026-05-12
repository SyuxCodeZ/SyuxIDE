const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('syuxAPI', {
  platform: process.platform
});

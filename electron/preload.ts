import { contextBridge } from 'electron';

// contextIsolation activé : on n'expose que le jeton de session du terminal
// Le frontend communique uniquement via WebSocket avec le backend Express
const tokenArg = process.argv.find(arg => arg.startsWith('--easygit-token='));

contextBridge.exposeInMainWorld('easyGit', {
  token: tokenArg ? tokenArg.slice('--easygit-token='.length) : '',
});

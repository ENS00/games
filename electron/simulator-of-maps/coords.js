const ipc = require('electron').ipcRenderer;

let button = document.getElementById('confirm');


button.addEventListener('click', () => {
  let x = Number(document.getElementById('coordX').value);
  let y = Number(document.getElementById('coordY').value);
  if (!isNaN(x) && !isNaN(y)) {
    ipc.send('coordinates', x, y);
    window.close();
  }
});
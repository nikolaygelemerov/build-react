const express = require('express');
const path = require('path');
const browserSync = require('browser-sync');
const chokidar = require('chokidar');

const server = express();

const PORT = 8090;

const staticMiddleware = express.static('src');

server.use(staticMiddleware);

// Create a browserSync instance
const bs = browserSync.create();

// Watch for changes in the src folder and reload the browser
const watcher = chokidar.watch('src/**/*');
watcher.on('change', () => {
  bs.reload();
});

server.get('*', (_req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'src', 'index.html'));
});

server.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);

  bs.init({
    proxy: `http://localhost:${PORT}`,
    open: true,
    notify: true,
    files: ['src/**/*'],
    favicon: path.resolve(__dirname, 'favicon.ico')
  });
});

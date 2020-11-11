import chalk from 'chalk';
import childProcess, { ChildProcess } from 'child_process';
import chokidar from 'chokidar';
import express from 'express';
import path from 'path';
import ws from 'ws';
import { HotReloadAction } from './utils/HotReload';
import { debounce } from './utils/debounce';
import { loadSCSSModule } from './utils/loaders/loadSCSSModule';

const DEBOUNCE_DELAY_MS = 200;
const HTTP_PORT = 3000;
const HTTP_PREFIX = process.env.HTTP_PREFIX || '';
export const WS_PORT = 3001;

process.env.NODE_ENV = 'development';

express()
  .use((_, res, next) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
  })
  .use(
    HTTP_PREFIX,
    express.static('dist', {
      cacheControl: false,
      extensions: ['html'],
    })
  )
  .listen(HTTP_PORT, () =>
    console.log(`Dev server started on http://localhost:${HTTP_PORT}`)
  );

const wsServer = new ws.Server({ port: WS_PORT });
let buildProcess: ChildProcess | undefined;

function sendToClients(data: string | HotReloadAction): void {
  const message = JSON.stringify(
    typeof data === 'string' ? { type: 'message', payload: data } : data
  );

  [...wsServer.clients]
    .filter((client) => client.readyState === client.OPEN)
    .forEach((client) => client.send(message));
}

const build = debounce(function build() {
  const startTime = Date.now();
  let error = '';

  console.log('Build...');
  sendToClients('build...');

  if (buildProcess) {
    buildProcess.kill();
  }

  const localBuildProcess = childProcess.spawn('yarn', ['build'], {
    cwd: process.cwd(),
    stdio: ['inherit', 'inherit', 'pipe'],
  });

  localBuildProcess.on('close', (code: number) => {
    if (buildProcess !== localBuildProcess) {
      return; // This one has been killed
    }

    buildProcess = undefined;

    if (code === 0) {
      console.log(
        chalk.green('Build success'),
        `${Math.round(Date.now() - startTime) / 1000}s`
      );
      sendToClients({ type: 'reloadPage' });
    } else {
      console.error(chalk.red('Build error'));
      sendToClients(`build error:\n\n${error}`);
    }
  });

  localBuildProcess.stderr?.on('data', (data: string) => {
    error += data.toString();
    console.error(data.toString());
  });

  buildProcess = localBuildProcess;
}, DEBOUNCE_DELAY_MS);

const reloadCSS = debounce(function reloadCSS(filePath: string) {
  const { css, id } = loadSCSSModule(path.join(process.cwd(), filePath));
  console.log(`Reload ${id}`);
  sendToClients({ type: 'reloadCSS', payload: { css, id } });
}, DEBOUNCE_DELAY_MS);

chokidar
  .watch(['public', 'scripts', 'src'], { cwd: process.cwd() })
  .on('all', (event, filePath) => {
    if (event == 'change' && /\.s?css$/.test(filePath)) {
      reloadCSS(filePath);
    } else if (['add', 'change', 'unlink'].includes(event)) {
      build();
    }
  });

build();

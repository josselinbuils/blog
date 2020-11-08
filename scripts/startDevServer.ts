import chalk from 'chalk';
import childProcess, { ChildProcess } from 'child_process';
import chokidar from 'chokidar';
import express from 'express';
import ws from 'ws';
import { debounce } from './utils/debounce';

const BUILD_DEBOUNCE_DELAY_MS = 200;
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

function sendToClients(message: string): void {
  [...wsServer.clients]
    .filter((client) => client.readyState === client.OPEN)
    .forEach((client) => client.send(message));
}

const build = debounce(function build() {
  const startTime = Date.now();

  console.log('Build...');
  sendToClients('build...');

  if (buildProcess) {
    buildProcess.kill();
  }

  const localBuildProcess = childProcess.exec(
    'yarn build',
    { cwd: process.cwd() },
    (error) => {
      if (buildProcess !== localBuildProcess) {
        return; // This one has been killed
      }

      buildProcess = undefined;

      if (!error) {
        console.log(
          chalk.green('Build success'),
          `${Math.round(Date.now() - startTime) / 1000}s`
        );
        sendToClients('reload');
      } else {
        console.error(chalk.red('Build error:', error));
      }
    }
  );
  buildProcess = localBuildProcess;
}, BUILD_DEBOUNCE_DELAY_MS);

chokidar
  .watch(['public', 'scripts', 'src'], { cwd: process.cwd() })
  .on('all', (event) => {
    if (['add', 'change', 'unlink'].includes(event)) {
      build();
    }
  });

build();

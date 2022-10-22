import path from 'path';
import { ExecQueue } from '@josselinbuils/utils/ExecQueue.js';
import chalk from 'chalk';
import chokidar from 'chokidar';
import fs from 'fs-extra';
import { type ServerOptions, WebSocketServer } from 'ws';
import paths from '../../../paths.json' assert { type: 'json' };
import type { HashedAsset } from '../generateHashedAsset';
import { generateHashedAsset } from '../generateHashedAsset';
import { generateHashedAssets } from '../generateHashedAssets';
import type { Page } from '../getPages';
import { getPages } from '../getPages';
import { renderPage } from '../renderPage';
import type { HotReloadAction } from './HotReloadAction';

const distAbsolutePath = path.join(process.cwd(), paths.DIST_DIR);

export class HotReloadServer extends WebSocketServer {
  private assets = [] as HashedAsset[];
  private readonly clientPathnames = [] as string[];
  private readonly execQueue = new ExecQueue();
  private pages = [] as Page[];

  constructor(options: ServerOptions) {
    super(options);

    const { execQueue, reloadAsset, reloadSourceFile, tryToBuildPage } = this;

    this.reloadAsset = execQueue.makeSync(reloadAsset.bind(this));
    this.reloadSourceFile = execQueue.makeSync(reloadSourceFile.bind(this));
    this.tryToBuildPage = execQueue.makeSync(tryToBuildPage.bind(this));

    this.on('connection', (client) => {
      client.on('message', (data: string) => {
        try {
          const action = JSON.parse(data) as HotReloadAction;

          if (action.type === 'setClientPathname') {
            const { clientPathnames } = this;
            const { pathname } = action.payload;

            clientPathnames.push(pathname);

            client.on('close', () => {
              clientPathnames.splice(clientPathnames.indexOf(pathname), 1);
            });
          }
        } catch (error: any) {
          console.error(`Unable to parse client message: ${error.stack}`);
        }
      });
    });

    this.execQueue.enqueue(async () => {
      const startTime = Date.now();

      console.log('Build core...');

      await fs.emptyDirSync(distAbsolutePath);
      this.assets = await generateHashedAssets();
      this.pages = await getPages();

      const chokidarOptions = { cwd: process.cwd(), ignoreInitial: true };

      ['add', 'change', 'unlink'].forEach((eventName) => {
        chokidar
          .watch(paths.PUBLIC_DIR, chokidarOptions)
          .on(eventName, this.reloadAsset);

        chokidar
          .watch(paths.SRC_DIR, chokidarOptions)
          .on(eventName, this.reloadSourceFile);
      });

      console.log(
        chalk.green('Build success'),
        `${Math.round(Date.now() - startTime) / 1000}s`
      );
    });
  }

  async tryToBuildPage(url: string): Promise<boolean> {
    const requestedSlug = url.slice(1);
    const page = this.pages.find(({ slug }) => slug === requestedSlug);

    if (page === undefined) {
      return false;
    }

    try {
      await this.buildPage(page);
      return true;
    } catch {
      return false;
    }
  }

  private async buildPage({ factory, slug }: Page): Promise<void> {
    const startTime = Date.now();

    console.log(`Build page: /${slug}`);

    try {
      await fs.outputFile(
        path.join(distAbsolutePath, `${slug || 'index'}.html`),
        renderPage(await factory(), this.assets),
        'utf8'
      );

      console.log(
        chalk.green('Build success'),
        `${Math.round(Date.now() - startTime) / 1000}s`
      );

      this.sendToClients({
        type: 'reloadPage',
        payload: { pathname: `/${slug}` },
      });
    } catch (error: any) {
      console.error(chalk.red(`Build error: ${error.stack}`));
      this.sendToClients(`build error:\n\n${error.stack}`);
    }
  }

  private getUniquePathnames(): string[] {
    return [...new Set(this.clientPathnames)];
  }

  private async reloadAsset(relativeFilePath: string): Promise<void> {
    const asset = this.assets.find(({ fromRelativeURL }) =>
      relativeFilePath.endsWith(fromRelativeURL)
    );
    if (asset !== undefined) {
      const { toRelativeURL } = asset;

      await fs.remove(path.join(distAbsolutePath, toRelativeURL));
      this.assets.splice(this.assets.indexOf(asset), 1);

      console.log(`Removed ${path.join(paths.DIST_DIR, toRelativeURL)}`);
    }

    if (await fs.pathExists(relativeFilePath)) {
      const newAsset = await generateHashedAsset(
        path.join(process.cwd(), relativeFilePath)
      );
      this.assets.push(newAsset);

      console.log(
        `Created ${path.join(paths.DIST_DIR, newAsset.toRelativeURL)}`
      );
    }

    this.getUniquePathnames().forEach((pathname) => {
      this.sendToClients({
        type: 'reloadPage',
        payload: { pathname },
      });
    });
  }

  private async reloadSourceFile(relativeFilePath: string): Promise<void> {
    const absoluteFilePath = path.join(process.cwd(), relativeFilePath);

    if (await fs.pathExists(relativeFilePath)) {
      (global as any).clearFileCache(absoluteFilePath);
    }

    for (const pathname of this.getUniquePathnames()) {
      const page = this.pages.find(({ slug }) => slug === pathname.slice(1));

      if (page !== undefined) {
        // eslint-disable-next-line no-await-in-loop
        await this.buildPage(page);
      }
    }
  }

  private sendToClients(data: string | HotReloadAction): void {
    const message = JSON.stringify(
      typeof data === 'string' ? { type: 'message', payload: data } : data
    );

    [...this.clients]
      .filter((client) => client.readyState === client.OPEN)
      .forEach((client) => client.send(message));
  }
}

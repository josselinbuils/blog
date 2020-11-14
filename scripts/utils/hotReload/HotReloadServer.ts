import { Deferred } from '@josselinbuils/utils';
import chalk from 'chalk';
import chokidar from 'chokidar';
import fs from 'fs-extra';
import path from 'path';
import { Server, ServerOptions } from 'ws';
import { DIST_DIR, PUBLIC_DIR, SRC_DIR } from '../../constants';
import { generateHashedAsset, HashedAsset } from '../generateHashedAsset';
import { generateHashedAssets } from '../generateHashedAssets';
import { getPages, Page } from '../getPages';
import { renderPage } from '../renderPage';
import { HotReloadAction } from './HotReloadAction';
import { fillDependencyMap } from '../fillDependencyMap';

const distAbsolutePath = path.join(process.cwd(), DIST_DIR);

// TODO add build queue
export class HotReloadServer extends Server {
  private assets = [] as HashedAsset[];
  private readonly clientPathnames = [] as string[];
  private readonly dependencyMap = {} as { [filename: string]: Set<string> };
  private pages = [] as Page[];
  private readyDeferred = new Deferred();

  constructor(options: ServerOptions) {
    super(options);

    this.reloadAsset = this.reloadAsset.bind(this);
    this.reloadSourceFile = this.reloadSourceFile.bind(this);
    this.tryToBuildPage = this.tryToBuildPage.bind(this);

    this.on('connection', (client) => {
      client.on('message', (data: string) => {
        try {
          const action = JSON.parse(data) as HotReloadAction;

          if (action.type === 'setClientPathname') {
            const { pathname } = action.payload;

            this.clientPathnames.push(pathname);

            client.on('close', () => {
              this.clientPathnames.splice(
                this.clientPathnames.indexOf(pathname),
                1
              );
            });
          }
        } catch (error) {
          console.error(`Unable to parse client message: ${error.stack}`);
        }
      });
    });

    (async () => {
      const startTime = Date.now();

      console.log('Build core...');

      await fs.emptyDirSync(distAbsolutePath);
      this.assets = await generateHashedAssets();
      this.pages = await getPages();

      const chokidarOptions = { cwd: process.cwd(), ignoreInitial: true };

      ['add', 'change', 'unlink'].forEach((eventName) => {
        chokidar
          .watch(PUBLIC_DIR, chokidarOptions)
          .on(eventName, this.reloadAsset);

        chokidar
          .watch(SRC_DIR, chokidarOptions)
          .on(eventName, this.reloadSourceFile);
      });

      console.log(
        chalk.green('Build success'),
        `${Math.round(Date.now() - startTime) / 1000}s`
      );

      this.readyDeferred.resolve();
    })();
  }

  async tryToBuildPage(url: string): Promise<boolean> {
    const startTime = Date.now();

    await this.readyDeferred.promise;

    const requestedSlug = url.slice(1);
    const page = this.pages.find(({ slug }) => slug === requestedSlug);

    if (page === undefined) {
      return false;
    }
    const { absolutePath, factory, slug } = page;

    console.log(`Build page: /${slug}`);

    try {
      await fs.outputFile(
        path.join(distAbsolutePath, `${slug || 'index'}.html`),
        renderPage(await factory(), this.assets),
        'utf8'
      );

      fillDependencyMap(
        this.dependencyMap,
        require.cache[absolutePath] as NodeJS.Module
      );

      console.log(
        chalk.green('Build success'),
        `${Math.round(Date.now() - startTime) / 1000}s`
      );

      this.sendToClients({
        type: 'reloadPage',
        payload: { pathname: `/${slug}` },
      });

      return true;
    } catch (error) {
      console.error(chalk.red(`Build error: ${error.stack}`));
      this.sendToClients(`build error:\n\n${error.stack}`);
    }
    return false;
  }

  private getUniquePathnames(): string[] {
    return [...new Set(this.clientPathnames)];
  }

  private async reloadAsset(relativeFilePath: string): Promise<void> {
    await this.readyDeferred.promise;
    this.readyDeferred = new Deferred();

    const asset = this.assets.find(({ fromRelativeURL }) =>
      relativeFilePath.endsWith(fromRelativeURL)
    );
    if (asset !== undefined) {
      const { toRelativeURL } = asset;

      await fs.remove(path.join(distAbsolutePath, toRelativeURL));
      this.assets.splice(this.assets.indexOf(asset), 1);

      console.log(`Removed ${path.join(DIST_DIR, toRelativeURL)}`);
    }

    if (await fs.pathExists(relativeFilePath)) {
      const newAsset = await generateHashedAsset(
        path.join(process.cwd(), relativeFilePath)
      );
      this.assets.push(newAsset);

      console.log(`Created ${path.join(DIST_DIR, newAsset.toRelativeURL)}`);
    }
    this.readyDeferred.resolve();

    this.getUniquePathnames().forEach((pathname) => {
      this.sendToClients({
        type: 'reloadPage',
        payload: { pathname },
      });
    });
  }

  private async reloadSourceFile(relativeFilePath: string): Promise<void> {
    const absoluteFilePath = path.join(process.cwd(), relativeFilePath);

    await this.readyDeferred.promise;

    if (await fs.pathExists(relativeFilePath)) {
      console.log(`Reload ${relativeFilePath}`);
    } else {
      console.log(`Unload ${relativeFilePath}`);
    }

    this.dependencyMap[absoluteFilePath]?.forEach((filename) => {
      delete require.cache[filename];
    });
    await Promise.all(this.getUniquePathnames().map(this.tryToBuildPage));
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

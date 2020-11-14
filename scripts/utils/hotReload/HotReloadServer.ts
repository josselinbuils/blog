import { Deferred } from '@josselinbuils/utils';
import chalk from 'chalk';
import chokidar from 'chokidar';
import fs from 'fs-extra';
import path from 'path';
import { Server, ServerOptions } from 'ws';
import { DIST_DIR, PUBLIC_DIR, SCRIPTS_DIR, SRC_DIR } from '../../constants';
import { debounce } from '../debounce';
import { generateHashedAssets, HashedAsset } from '../generateHashedAssets';
import { getPages, Page } from '../getPages';
import { loadSCSSModule } from '../loaders/loadSCSSModule';
import { renderPage } from '../renderPage';
import { HotReloadAction } from './HotReloadAction';

const DEBOUNCE_DELAY_MS = 200;

const distAbsolutePath = path.join(process.cwd(), DIST_DIR);

export class HotReloadServer extends Server {
  private assets = [] as HashedAsset[];
  private pages = [] as Page[];
  private readyDeferred = new Deferred();

  constructor(options: ServerOptions) {
    super(options);

    (async () => {
      const startTime = Date.now();

      console.log('Build core...');

      await fs.emptyDirSync(distAbsolutePath);
      this.assets = await generateHashedAssets();
      this.pages = await getPages();

      const reloadCSS = debounce(this.reloadCSS.bind(this), DEBOUNCE_DELAY_MS);

      chokidar
        .watch([PUBLIC_DIR, SCRIPTS_DIR, SRC_DIR], { cwd: process.cwd() })
        .on('all', (event, filePath) => {
          if (event == 'change' && /\.s?css$/.test(filePath)) {
            reloadCSS(filePath);
          } else if (['add', 'change', 'unlink'].includes(event)) {
            // build();
          }
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
    const { content, slug } = page;

    console.log(`Build page: /${slug}`);

    try {
      await fs.outputFile(
        path.join(distAbsolutePath, `${slug || 'index'}.html`),
        renderPage(content, this.assets),
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

      return true;
    } catch (error) {
      console.error(chalk.red(`Build error: ${error.stack}`));
      this.sendToClients(`build error:\n\n${error.stack}`);
    }
    return false;
  }

  private reloadCSS(filePath: string) {
    const { css, id } = loadSCSSModule(path.join(process.cwd(), filePath));
    console.log(`Reload ${id}`);
    this.sendToClients({ type: 'reloadCSS', payload: { css, id } });
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

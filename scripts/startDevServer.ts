import express from 'express';
import paths from '../paths.json' assert { type: 'json' };
import { HotReloadServer } from './utils/hotReload/HotReloadServer';

const HTTP_PORT = 3000;
const HTTP_PREFIX = process.env.HTTP_PREFIX || '';
const WS_PORT = 3001;

process.env.NODE_ENV = 'development';

process.on('unhandledRejection', (error) => {
  console.error(error);
});

let hotReloadServer: HotReloadServer;

express()
  .use((_, res, next) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
  })
  .use(
    HTTP_PREFIX,
    express.static(paths.DIST_DIR, {
      cacheControl: false,
      extensions: ['html'],
    })
  )
  .use(async (req, res, next) => {
    const hasBuiltPage = await hotReloadServer.tryToBuildPage(req.url);

    if (hasBuiltPage) {
      res.redirect(307, req.url);
    }
    next();
  })
  .listen(HTTP_PORT, () => {
    console.log(`Dev server started on http://localhost:${HTTP_PORT}`);
    hotReloadServer = new HotReloadServer({ port: WS_PORT });
  });

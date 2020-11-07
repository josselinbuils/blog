const express = require('express');

const HTTP_PREFIX = process.env.HTTP_PREFIX || '';
const PORT = 3000;

express()
  .use((req, res, next) => {
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
  .listen(PORT, () =>
    console.log(`Dev server started on http://localhost:3000`)
  );

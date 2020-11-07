const express = require('express');

const PORT = 3000;

express()
  .use((req, res, next) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
  })
  .use(express.static('dist', { extensions: ['html'] }))
  .use(express.static('public'))
  .listen(PORT, () =>
    console.log(`Dev server started on http://localhost:3000`)
  );

'use strict';

const https = require('https');
const fs = require('fs');
const path = require('path');

/**
 * Cria um servidor HTTPS para o app Express dado, usando os
 * certificados configurados em CERT_DIR.
 */
function createHttpsServer(app, { rootDir, certDir, certKeyFile, certFile }) {
  return https.createServer(
    {
      key: fs.readFileSync(path.join(rootDir, certDir, certKeyFile)),
      cert: fs.readFileSync(path.join(rootDir, certDir, certFile))
    },
    app
  );
}

module.exports = createHttpsServer;

'use strict';

const https = require('https');
const fs = require('fs');
const path = require('path');

/**
 * Cria um servidor HTTPS para o app Express dado, usando os
 * certificados configurados em CERT_DIR.
 */
function createHttpsServer(app, 
  { 
    rootDir, 
    certDir, 
    certKeyFile, 
    certFile 
  }) {
    const keyPath = path.join(rootDir, certDir, certKeyFile);
    const certPath = path.join(rootDir, certDir, certFile);

    if (!fs.existsSync(keyPath)) {
      throw new Error(`Certificado não encontrado: ${keyPath}`);
    }
    if (!fs.existsSync(certPath)) {
      throw new Error(`Certificado não encontrado: ${certPath}`);
    }

  return https.createServer(
    {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    },
    app
  );
}

module.exports = createHttpsServer;

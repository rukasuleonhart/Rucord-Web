'use strict';

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

/**
 * Cria o servidor HTTP(S) para o app Express dado.
 *
 * - Em desenvolvimento local, se os certificados existirem em
 *   CERT_DIR, sobe HTTPS (necessário pra testar getDisplayMedia
 *   em alguns navegadores fora do localhost).
 * - Em produção (Render, Railway, Fly.io, etc.) o TLS é feito
 *   pela plataforma/proxy na frente do processo Node, então
 *   aqui sobe HTTP puro. Isso é controlado por NODE_ENV/VERCEL
 *   e pela ausência dos arquivos de certificado.
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

    const hasCerts = fs.existsSync(keyPath) && fs.existsSync(certPath);
    const isProduction = process.env.NODE_ENV === 'production';

    if (!hasCerts || isProduction) {
      if (!isProduction) {
        console.log(
          '[server] Certificado não encontrado em ' + certDir +
          ', subindo em HTTP (sem TLS local).'
        );
      }
      return http.createServer(app);
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

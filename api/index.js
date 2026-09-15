'use strict';

const path = require('path');
const express = require('express');

const config = require('../src/config');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const publicPath = path.join(
  __dirname,
  '..',
  config.PUBLIC_DIR
);

app.use(express.static(publicPath));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    ok: true,
    environment: process.env.VERCEL ? 'vercel' : 'local'
  });
});

module.exports = app;
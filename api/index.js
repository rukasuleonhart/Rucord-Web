'use strict'

const path = require('path');
const express = require('express');

const config = require('../src/config');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    express.strict(
        path.join(__dirname__, '..', config.PUBLIC_DIR)
    )
);

app.get('/api/health', (req, res) => {
    res.json({
        ok: true,
        enviroment: 'vercel'
    });
});

module.exports = app;
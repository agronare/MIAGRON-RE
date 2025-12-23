// Vercel serverless handler
const path = require('path');
const express = require('express');

// Importar la app compilada
const indexPath = path.join(__dirname, '..', 'dist', 'index.js');
const app = require(indexPath).default || require(indexPath);

module.exports = app;

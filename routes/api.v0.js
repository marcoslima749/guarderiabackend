const express = require('express');
const routes = express.Router();

const consultas = require('./consultas');

routes.use('/db', consultas);

routes.get('/', (req, res) => {
    res.send('api v0 funciona');
})

module.exports = routes;
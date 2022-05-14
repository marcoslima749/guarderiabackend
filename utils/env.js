//Lee el archivo .env para exportar las variables de entorno

const fs = require('fs');
const path = require('path');

const envParser = () => {
    const envObj = {};
    const texto = fs.readFileSync(path.join(__dirname, '..', '..', '.env')).toString('utf-8');
    const lineas = texto.split('\n');
    lineas.forEach((linea) => {
        let par = linea.split('=');
        envObj[par[0]] = par[1].match('(.+)(?:\\r)') ? par[1].match('(.+)(?:\\r)')[1] : par[1];
    });
    return envObj
}

module.exports = envParser;
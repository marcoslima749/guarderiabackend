const express = require('express');
const mysql = require('mysql');
const cron = require('node-cron'); //Esto no va a andar en el regimen free porque el serve se duerme ver workarounds

//importando las rutas
const login = require('./routes/login');
const api = require('./routes/api.v0');


//creando la conección a la base de datos
//puede que esto no sea escalable con múltiples usuarios porque estarían usando todos la misma conexión.
//revisar si esto ocasiona problemas de performance o una posible caída del servidor
//si es así modificar para que cada usuario tenga su propia conección a la base de datos

const db = mysql.createConnection({
    host : process.env.DB_HOST,
    user : process.env.DB_USUARIO,
    password: process.env.DB_PASS,
    database: process.env.DB_BASE,
    flags: 'MULTI_STATEMENTS'
});

cron.schedule('12 15 25 * *', ()=> {
    console.log('tarea programada para el 25 de cada mes a las 15:12 funciona');
});


 
db.connect((err)=> {
    if(err){
        throw err;
    }
    console.log("Base de datos conectada!");
    app.set('db', db);
})


const app = express();

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

//Rutas

app.use('/login', login);
app.use('/api', api);

app.get('/',(req, res)=> {
    //Acá mandar la reactapp
    res.send('Hola desde el servidor');
})



app.listen(process.env.PORT || PORT, () => {
    console.log(`Server started on port ${process.env.PORT || PORT}`);
});

 
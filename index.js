const express = require('express');
const mysql = require('mysql');
const cron = require('node-cron'); //Esto no va a andar en el regimen free porque el serve se duerme ver workarounds

//importando las rutas
const login = require('./routes/login');
const api = require('./routes/api.v0');

const cors = require("cors");

const app = express();


//creando la conección a la base de datos
//puede que esto no sea escalable con múltiples usuarios porque estarían usando todos la misma conexión.
//revisar si esto ocasiona problemas de performance o una posible caída del servidor
//si es así modificar para que cada usuario tenga su propia conección a la base de datos

let db = mysql.createConnection({
    host : process.env.DB_HOST,
    user : process.env.DB_USUARIO,
    password: process.env.DB_PASS,
    database: process.env.DB_BASE,
    flags: 'MULTI_STATEMENTS'
});

let reconeccion = 0;

const manejarDesconeccion = (error) => {
    
        db = mysql.createConnection({
            host : process.env.DB_HOST,
            user : process.env.DB_USUARIO,
            password: process.env.DB_PASS,
            database: process.env.DB_BASE,
            flags: 'MULTI_STATEMENTS'
        });

        db.connect((err)=> {
            if(err){
                manejarDesconeccion(err);
            } else {
                console.log("Base de datos re-conectada!");

                db.on('error', error => {
                    if (error?.code === 'PROTOCOL_CONNECTION_LOST') {
                        // db error reconnect
                        console.log('error en la coneccion de la base. Reconeccion ' + reconeccion + ' : ', error.code);
                        manejarDesconeccion(error);
                    } else {
                        console.log('error de otra indole. Verificar: ', error);
                        manejarDesconeccion(error);
                    }
                });

                app.set('db', db);
                reconeccion++
            }
        });
    
}

/* cron.schedule('12 15 25 * *', ()=> {
    console.log('tarea programada para el 25 de cada mes a las 15:12 funciona');
}); */



db.connect((err)=> {
    if(err){
        manejarDesconeccion(err);
        return;
    }

    db.on('error', error => {
        if (error?.code === 'PROTOCOL_CONNECTION_LOST') {
            // db error reconnect
            console.log('error en la coneccion de la base. Reconeccion ' + reconeccion + ' : ', error.code);
            manejarDesconeccion(error);
        } else {
            console.log('error de otra indole. Verificar: ', error);
            manejarDesconeccion(error);
        }
    });

    app.set('db', db);
    console.log("Base de datos conectada!");
});








app.use(cors(/* {origin: ["https://demoguarderia.web.app/", "https://demoguarderia.web.app/"]} */));

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

 
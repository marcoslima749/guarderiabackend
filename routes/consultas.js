const express = require('express');
const routes = express.Router();
const sql = require('./consultas/sql');



routes.get('/resumen',(req, res) => {
    const db = req.app.get('db');
    db.query(sql.embarcaciones.resumen,(error, results, fields) => {
        if (error) throw error;
        console.log('results: ', JSON.stringify(results));
        res.json(results);
    })
    console.log(req.body);
}); 



routes.get('/tareas',(req, res) => {
    const db = req.app.get('db');
    db.query(sql.tareas.todo ,(error, results, fields) => {
        if (error) throw error;
        res.json(results);
    })
});

routes.post('/tareas',(req,res)=> {
    let log = 'LOG: ---------------------------------------------\n\n';
    const db = req.app.get('db');
    let consulta = '';
    let tarea = JSON.parse(JSON.stringify(req.body.tarea));
    let campos = [];
    let valores = [];

    log += 'request body: ' + JSON.stringify(req.body) + '\n\n';

    switch (req.body.mod) {
        case 'nuevo' :
            delete tarea.idtareas;
            campos = Object.keys(tarea);
            valores = campos.map((llave)=>tarea[llave])
            consulta = sql.tareas.insertar(campos, valores); 
            log += 'Case: nuevo. Campos: ' + JSON.stringify(campos) + 'Valores: ' + JSON.stringify(valores) + 'Consulta: ' + JSON.stringify(consulta) + '\n\n';
            break;
        case 'modificado' :
            campos = req.body.campos;
                consulta = campos.map((llave)=>sql.tareas.modificar(llave, tarea[llave], tarea.idtareas)).join(';');
                log += 'Case: modificado. Campos: ' + campos + 'Consulta: ' +  JSON.stringify(consulta) + '\n\n';
            break;
        case 'eliminado':
            consulta = sql.tareas.eliminar(tarea.idtareas);
            log += 'Case: Elminidado. Consulta: ' + JSON.stringify(consulta) + '\n\n';
            break;
        default:
            log += 'Valor inválido en la propiedad mod del request body: ' + req.body.mod + '\n\n';
            log+= 'Final LOG ----------------------------------------'
            console.log(log);
            return;
        };


        log+= 'Reemplazando valores vacios por null \n\n';
        consulta = consulta.replace(/''/g, 'null');
        log+= 'Consulta modificada:\n\n' + JSON.stringify(consulta) + '\n\n';


        db.query(consulta, (error, results, _fields)=>{
            if (error) {
                log += 'ERROR!: ' + error + '\n\n';
                log += 'Final LOG ----------------------------------------'
                console.log(log);
                throw error;
            }

            log += 'Base consultada correctamente. Results: ' +  JSON.stringify(results) + '\n\n';
            if (req.body.mod === 'nuevo') {
                log+= 'Enviando Respuesta (NUEVO): ' + JSON.stringify({results, nuevaID : results.insertId}) + '\n\n';
                res.json({results, nuevaID : results.insertId});
            } else {
                log+= 'Enviando Respuesta (NO NUEVO): ' + JSON.stringify(results) + '\n\n';
                res.send(results);
            }
            
            log+= 'Final LOG ----------------------------------------'
            console.log(log);

        });
            
});


routes.get('/embarcaciones/:id/cl', (req, res)=> {
    const db = req.app.get('db');
    const id = req.params.id;
    db.query(sql.embarcaciones.clientes(id), (error, results, fields)=>{
        if (error) throw error;
        res.json(results);
    })
    
});

routes.put('/embarcaciones/:id/m', (req, res) => {
    const db = req.app.get('db');
    const id = req.params.id;
    let embarcacion = JSON.parse(JSON.stringify(req.body.embarcacion));
    //modifica los campos de la embarcacion para la base
    embarcacion['contrato_fecha'] = embarcacion.contrato;
    delete embarcacion.contrato;
    embarcacion['seguro_fecha'] = embarcacion.seguro;
    delete embarcacion.seguro;
    //sacar el comment cuando esté la fecha de baja
    //embarcacion[baja_fecha] = embarcacion.baja;
    //delete embarcacion.baja;

    let campos = JSON.parse(JSON.stringify(req.body.campos));
    if (campos.includes('contrato')) {
        campos.splice(campos.indexOf('contrato'), 1, 'contrato_fecha');
    }
    if (campos.includes('seguro')) {
        campos.splice(campos.indexOf('seguro'), 1, 'seguro_fecha');
    }
    if (campos.includes('baja')) {
        campos.splice(campos.indexOf('baja'), 1, 'baja_fecha');
    }

    let consulta = campos.map((llave)=>sql.embarcaciones.modificar(llave, embarcacion[llave], id)).join(';');
    res.send(consulta);
    return;
    db.query(consulta, (error, results, fields)=> {
        if (error) throw error;
        res.send(results);
    })
})


routes.get('/embarcaciones/:id', (req, res)=> {
    const db = req.app.get('db');
    const id = req.params.id;
    db.query(sql.embarcaciones.seleccionar(id), (error, results, fields)=>{
        if (error) throw error;
        res.json(results);
    })
    
});


routes.get('/clientes/:id/mails', (req, res)=> {
    const db = req.app.get('db');
    const id = req.params.id;
    db.query(sql.clientes.mails.consultar(id), (error, results, fields)=>{
        if (error) throw error;
        res.json(results);
    })
});

routes.get('/clientes/:id/telefonos', (req, res)=> {
    const db = req.app.get('db');
    const id = req.params.id;
    db.query(sql.clientes.telefonos.consultar(id), (error, results, fields)=>{
        if (error) throw error;
        res.json(results);
    })
});

routes.get('/clientes/:id/forma-de-facturacion', (req, res)=> {
    const db = req.app.get('db');
    const id = req.params.id;
    db.query(sql.clientes.forma_de_facturacion.consultar(id), (error, results, fields)=>{
        if (error) throw error;
        res.json(results);
    })
});

routes.get('/clientes/:id/forma-de-pago', (req, res)=> {
    const db = req.app.get('db');
    const id = req.params.id;
    db.query(sql.clientes.forma_de_pago.consultar(id), (error, results, fields)=>{
        if (error) throw error;
        res.json(results);
    })
});

routes.get('/formas-de-pago', (req, res)=> {
    const db = req.app.get('db');
    db.query(sql.listaFormasPago.consultar(),(error, results, fields)=>{
        if (error) throw error;
        res.json(results);
    })

})


routes.get('/clientes/:id/embarcaciones', (req, res)=> {
    const db = req.app.get('db');
    const id = req.params.id;
    db.query(sql.clientes.listaEmb(id), (error, results, fields)=>{
        if (error) throw error;
        res.json(results);
    })
});

routes.get('/clientes/:id/observaciones', (req, res)=>{
    const db = req.app.get('db');
    const id = req.params.id;
    db.query(sql.clientes.observaciones.consultar(id), (error, results, fields)=>{
        if(error) throw error;
        res.json(results);
    })
})



routes.get('/clientes/:id/cta-cte/cuotas', (req, res)=>{
    const db = req.app.get('db');
    const id = req.params.id;
    db.query(sql.clientes.cta_cte.cuotas(id), (error, results, fields)=>{
        if(error) throw error;
        res.json(results);
    })
})

routes.get('/clientes/:id/cta-cte/tasas', (req, res)=>{
    const db = req.app.get('db');
    const id = req.params.id;
    db.query(sql.clientes.cta_cte.tasas(id), (error, results, fields)=>{
        if(error) throw error;
        res.json(results);
    })
})

routes.get('/clientes/:id/cta-cte/pagos', (req, res)=>{
    const db = req.app.get('db');
    const id = req.params.id;
    db.query(sql.clientes.cta_cte.pagos(id), (error, results, fields)=>{
        if(error) throw error;
        res.json(results);
    })
})

routes.get('/clientes/:id/cta-cte', (req, res)=>{
    const db = req.app.get('db');
    const id = req.params.id;
    db.query(sql.clientes.cta_cte.estado(id), (error, results, fields)=>{
        if(error) throw error;
        res.json(results);
    })
})




routes.put('/clientes/:id/guardar-cambios',(req, res) => {
    const db = req.app.get('db');
    const id = req.params.id;
    console.log('req.body: ', req.body);
    let cambios = JSON.parse(JSON.stringify(req.body));
    let consulta = '';
    
    for (let tabla in cambios) {
        switch (tabla) {
            case 'clientes':
                for (let campo in cambios.clientes) {
                    if(campo === 'idclientes'){
                        continue;
                    }
                    consulta = consulta + sql.clientes.modificarCliente(campo, cambios.clientes[campo], cambios.clientes.idclientes) + ';'; //los ; tienen que venir en la misma sentencia!
                }
            break;
            case 'mails':
                let consultaMails = '';
                if (cambios.mails.insertar) {consultaMails =  consultaMails + cambios.mails.insertar.map((mail)=> sql.clientes.mails.insertar(id,mail.mail)).join('');}
                if (cambios.mails.eliminar) {consultaMails =  consultaMails + cambios.mails.eliminar.map((mail)=> sql.clientes.mails.eliminar(mail.idmails)).join('');}
                console.log('append mails: ', consultaMails)
                consulta = consulta + consultaMails;
            break;
            case 'telefonos':
                
                let consultaTelefonos = '';
                if (cambios.telefonos.insertar) {consultaTelefonos =  consultaTelefonos + cambios.telefonos.insertar.map((tel)=> sql.clientes.telefonos.insertar(id,tel.telefono)).join('');}
                if (cambios.telefonos.eliminar) {consultaTelefonos =  consultaTelefonos + cambios.telefonos.eliminar.map((tel)=> sql.clientes.telefonos.eliminar(tel.idtelefonos)).join('');}
                console.log('append telefonos: ', consultaTelefonos)
                consulta = consulta + consultaTelefonos;
                break;
            case 'observaciones':
                    
                let consultaObservaciones = '';
                if (cambios.observaciones.insertar) {consultaObservaciones =  consultaObservaciones + cambios.observaciones.insertar.map((obs)=> sql.clientes.observaciones.insertar(id,obs.observacion)).join('');}
                if (cambios.observaciones.eliminar) {consultaObservaciones =  consultaObservaciones + cambios.observaciones.eliminar.map((obs)=> sql.clientes.observaciones.eliminar(obs.idobservaciones)).join('');}
                console.log('append telefonos: ', consultaObservaciones)
                consulta = consulta + consultaObservaciones;
                    
            break;
            
            case 'forma_de_pago':
                
                let consultaFormaDePago = '';
                if (cambios.forma_de_pago.insertar) {consultaFormaDePago =  consultaFormaDePago + cambios.forma_de_pago.insertar.map((forma)=> sql.clientes.forma_de_pago.insertar(id,forma.forma_de_pago_idforma_de_pago, forma.numero)).join('');}
                if (cambios.forma_de_pago.eliminar) {consultaFormaDePago =  consultaFormaDePago + cambios.forma_de_pago.eliminar.map((forma)=> sql.clientes.forma_de_pago.eliminar(forma.idforma_de_pago_has_clientes)).join('');}
                console.log('append forma de pago: ', consultaFormaDePago)
                consulta = consulta + consultaFormaDePago;
                
                
                break;
                case 'forma_de_facturacion':
                    
                    let consultaFormaFacturacion = '';
                    if (cambios.forma_de_facturacion.insertar) {consultaFormaFacturacion =  consultaFormaFacturacion + cambios.forma_de_facturacion.insertar.map((forma)=> sql.clientes.forma_de_facturacion.insertar(forma.numero_cliente, forma.razon_social, forma.documento, forma.iva, forma.tipo_de_factura,id)).join('');}
                    if (cambios.forma_de_facturacion.eliminar) {consultaFormaFacturacion =  consultaFormaFacturacion + cambios.forma_de_facturacion.eliminar.map((forma)=> sql.clientes.forma_de_facturacion.eliminar(forma.idforma_de_facturacion)).join('');}
                    console.log('append forma de facturacion: ', consultaFormaFacturacion)
                    consulta = consulta + consultaFormaFacturacion;


            break;
            default:
                
        }
    }

    res.send(consulta);
    
})

routes.get('/clientes/:id', (req, res)=> {
    const db = req.app.get('db');
    const id = req.params.id;
    db.query(sql.clientes.seleccionar(id), (error, results, fields)=>{
        if (error) throw error;
        res.json(results);
    })
});


routes.get('/', (req, res)=> {
    res.send('api db funciona');   
});


/*
para obtener el id de una fila insertada

connection.query('INSERT INTO posts SET ?', {title: 'test'}, function (error, results, fields) {
  if (error) throw error;
  console.log(results.insertId);
});

*/

module.exports = routes;
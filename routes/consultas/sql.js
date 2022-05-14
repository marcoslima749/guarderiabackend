//Patrones comunes

const select = (tabla, campo, where) => {
    return `SELECT ${campo} FROM ${tabla}${where ? ' WHERE ' + where : ''}`;
};

const todo = (tabla) => {
    return select(tabla, '*');
};

const eliminar = (tabla, campo, valor) => {
    return `DELETE FROM ${tabla} WHERE (${campo} = '${valor}')`;
};

const insertar = (tabla, campos, valores) => {
    return `INSERT INTO ${tabla} ( ${campos.join(' , ')} ) VALUES ( '${valores.join("' , '")}' )`
};

const modificar = (tabla, campo, valor, ID, valorID) => {
    return `UPDATE ${tabla} SET ${campo} = '${valor}' WHERE (${ID} = '${valorID}')`
};

/*
console.log(select('tareas', 'descripcion',"idtareas = '1'"));
console.log(select('tareas', '*'));
console.log(todo('tareas'));
console.log(eliminar('tareas', 'idtareas','1'));
console.log(insertar('tareas', ['campo1', 'campo2', 'campo3'],['valor1', 'valor2', 'valor3']));
*/



//Tablas

//Tareas

const tareas = {
    todo : todo('tareas'),
    eliminar : (id) => eliminar('tareas', 'idtareas', id),
    
    // INSERT INTO `guarderiadb`.`tareas` (`descripcion`, `nota`, `deadline`, `prioridad`, `completado`) VALUES ('nueva descr', 'nota de la desc', '2020-09-01', '3', '0');

    insertar : (campos, valores) => insertar('tareas', campos, valores),
    modificar: (campo, valor, id) => modificar('tareas', campo, valor, 'idtareas', id)
}

//Embarcaciones

const embResumen =
`SELECT
embarcaciones.idembarcaciones AS ID,
embarcaciones.nombre AS Embarcacion,
categorias.idcategorias AS Cat,
CONCAT(clientes.apellido, ', ' , clientes.nombre) AS Cliente,
clientes.idclientes AS IDc,
embarcaciones_has_clientes.porcentaje_posesion AS '%',
'Sin Datos' as Estado,
'0' as Pendiente
FROM
embarcaciones
JOIN categorias_has_embarcaciones ON categorias_has_embarcaciones.id_embarcaciones = embarcaciones.idembarcaciones
JOIN categorias ON categorias.idcategorias = categorias_has_embarcaciones.id_categorias
JOIN embarcaciones_has_clientes ON embarcaciones_has_clientes.embarcaciones_idembarcaciones = embarcaciones.idembarcaciones
JOIN clientes ON clientes.idclientes = embarcaciones_has_clientes.clientes_idclientes
;`;

const embTarifaId = (id) =>
`SELECT
embarcaciones.nombre AS nombre,
embarcaciones.idembarcaciones AS Id,
categorias.idcategorias AS categoria,
embarcaciones.marca AS marca,
embarcaciones.modelo AS modelo,
tarifas.tarifa AS tarifa,
tasas.tasa AS tasa,
(tarifas.tarifa + tasas.tasa) AS total,
embarcaciones.eslora AS eslora,
embarcaciones.manga AS manga,
embarcaciones.puntal AS puntal,
embarcaciones.contrato_fecha AS contrato,
embarcaciones.matricula AS matricula,
embarcaciones.seguro_fecha AS seguro
FROM
embarcaciones
JOIN categorias_has_embarcaciones ON categorias_has_embarcaciones.id_embarcaciones = embarcaciones.idembarcaciones
JOIN categorias ON categorias.idcategorias = categorias_has_embarcaciones.id_categorias
JOIN tasas ON tasas.categoria = categorias.idcategorias
JOIN rangos_precio_has_embarcaciones ON rangos_precio_has_embarcaciones.embarcaciones_idembarcaciones = embarcaciones.idembarcaciones
JOIN rangos_precio ON rangos_precio.idrangos_precio = rangos_precio_has_embarcaciones.rangos_precio_idrangos_precio
JOIN tarifas ON tarifas.rangos_precio_idrangos_precio = rangos_precio.idrangos_precio
WHERE
embarcaciones.idembarcaciones = '${id}'
ORDER BY tarifas.vigencia DESC, tasas.vigencia DESC LIMIT 1;`;

const embClientes = (id) =>
    `SELECT
    clientes.apellido,
    clientes.nombre,
    embarcaciones_has_clientes.porcentaje_posesion AS posesion,
    clientes.idclientes AS id
    FROM
    embarcaciones
    JOIN embarcaciones_has_clientes ON embarcaciones_has_clientes.embarcaciones_idembarcaciones = embarcaciones.idembarcaciones
    JOIN clientes ON clientes.idclientes = embarcaciones_has_clientes.clientes_idclientes
    WHERE embarcaciones.idembarcaciones = '${id}';`;

const embModificar = (campo, valor, id) => modificar('embarcaciones', campo, valor, 'idembarcaciones', id)



const embarcaciones = {
    todo : todo('embarcaciones'),
    resumen: embResumen,
    seleccionar : embTarifaId,
    clientes : embClientes,
    modificar: embModificar
}


const obtenerMails = id =>
`SELECT
mails.mail, mails.idmails
FROM 
mails
JOIN clientes ON clientes.idclientes = mails.clientes_idclientes
WHERE
clientes.idclientes = '${id}';
`;

const agregarMail = (idCliente, mail) => `INSERT INTO mails (clientes_idclientes, mail) VALUES ('${idCliente}', '${mail}');`;
const eliminarMail = (idMail) => `DELETE FROM mails WHERE (idmails = '${idMail}');`;


const cliente = id => `
SELECT
clientes.idclientes,
clientes.apellido,
clientes.nombre,
clientes.documento,
clientes.direccion,
clientes.localidad,
clientes.provincia,
clientes.pais,
clientes.codigo_postal,
forma_de_pago.forma_de_pago,
forma_de_facturacion.numero_cliente,
forma_de_facturacion.razon_social,
forma_de_facturacion.documento,
forma_de_facturacion.iva,
forma_de_facturacion.tipo_de_factura
FROM
clientes
JOIN forma_de_pago ON forma_de_pago.clientes_idclientes = clientes.idclientes
JOIN forma_de_facturacion ON forma_de_facturacion.clientes_idclientes = clientes.idclientes
WHERE
clientes.idclientes = '${id}';`

const formaPago = (id) => `
SELECT *
FROM forma_de_pago
JOIN forma_de_pago_has_clientes ON forma_de_pago_idforma_de_pago = forma_de_pago.idforma_de_pago
WHERE
forma_de_pago_has_clientes.clientes_idclientes = '${id}';
`;

const insertarFormaPago = (idCliente, idFormaPago, numero) => `INSERT INTO forma_de_pago_has_clientes (clientes_idclientes, forma_de_pago_idforma_de_pago ${numero ? ', numero' : '' }) VALUES ('${idCliente}','${idFormaPago}'${numero ? ",'" + numero + "'" : ""});`
const eliminarFormaPago = (idFormaPagoHasClientes) => `DELETE FROM forma_de_pago_has_clientes WHERE (idforma_de_pago_has_clientes = '${idFormaPagoHasClientes}');`

const formaFacturacion = (id) => `
SELECT * FROM forma_de_facturacion WHERE clientes_idclientes = '${id}';
`;

const insertarFormaFacturacion = (numero_cliente, razon_social, documento, iva, tipo_de_factura, clientes_idclientes) => `
INSERT INTO forma_de_facturacion (numero_cliente, razon_social, documento, iva, tipo_de_factura, clientes_idclientes)
VALUES ('${numero_cliente}', '${razon_social}', '${documento}', '${iva}', '${tipo_de_factura}', '${clientes_idclientes}');
`;

const eliminarFormaFacturacion = (idforma_de_facturacion) => `
DELETE FROM forma_de_facturacion WHERE (idforma_de_facturacion = '${idforma_de_facturacion}');
`;

const obtenerTelefonos = (id) => 
    `SELECT
    telefonos.telefono, telefonos.idtelefonos
    FROM 
    telefonos
    JOIN clientes ON clientes.idclientes = telefonos.clientes_idclientes
    WHERE
    clientes.idclientes = '${id}';
    `;

const insertarTelefono = (idCliente, telefono, observ) => `INSERT INTO telefonos (clientes_idclientes, telefono${observ ? ', observacion' : '' }) VALUES('${idCliente}' , '${telefono}'${observ ? ",'" + observ + "'" : "" });`;
const eliminarTelefono = (idTelefono) => `DELETE FROM telefonos WHERE idtelefonos = '${idTelefono}';`

const listaEmb = (id) =>
`SELECT embarcaciones.idembarcaciones AS id, embarcaciones.nombre
FROM clientes
JOIN embarcaciones_has_clientes ON embarcaciones_has_clientes.clientes_idclientes = clientes.idclientes
JOIN embarcaciones ON embarcaciones.idembarcaciones = embarcaciones_has_clientes.embarcaciones_idembarcaciones
WHERE clientes.idclientes = '${id}';`
;

const obtenerObservaciones = (id) =>
`SELECT * FROM observaciones WHERE observaciones.clientes_idclientes = '${id}';`;
const insertarObservacion = (idCliente, obs) => `INSERT INTO observaciones (clientes_idclientes, observacion) VALUES ('${idCliente}', '${obs}')`;
const eliminarObservacion = (idObs) => `DELETE FROM observaciones WHERE idobservaciones = '${idObs}'`;

const cModificarCliente = (campo, valor, id) => modificar('clientes', campo, valor, 'idclientes', id);
const cModificarFormaFacturacion = (campo, valor, id) => modificar('forma_de_facturacion', campo, valor, 'idforma_de_facturacion', id);

const cCuotas= (idCliente) => `
SELECT mensualidad.idmensualidad AS IDm, detalle_mensualidad.iddetalle_mensualidad AS IDd, mensualidad.periodo, clientes.idclientes AS IDcl, clientes.apellido, embarcaciones.idembarcaciones AS IDemb, embarcaciones.nombre, concepto_producto.descripcion,
detalle_mensualidad.valor_contingencia AS Valor
FROM 
mensualidad
JOIN detalle_mensualidad ON detalle_mensualidad.mensualidad_idmensualidad = mensualidad.idmensualidad
JOIN concepto_producto ON concepto_producto.idconcepto_producto = detalle_mensualidad.concepto_producto_idconcepto_producto
JOIN clientes ON clientes.idclientes = mensualidad.clientes_idclientes
JOIN embarcaciones_has_clientes ON embarcaciones_has_clientes.clientes_idclientes = clientes.idclientes
JOIN embarcaciones ON embarcaciones.idembarcaciones = embarcaciones_has_clientes.embarcaciones_idembarcaciones

WHERE clientes.idclientes = '${idCliente}'
AND detalle_mensualidad.concepto_producto_idconcepto_producto = '1'

UNION

(SELECT mensualidad.idmensualidad AS IDm, detalle_mensualidad.iddetalle_mensualidad AS IDd, mensualidad.periodo, clientes.idclientes AS IDcl, clientes.apellido, embarcaciones.idembarcaciones AS IDemb, embarcaciones.nombre, concepto_producto.descripcion, MAX(tarifas.tarifa)
FROM 
mensualidad

JOIN detalle_mensualidad ON detalle_mensualidad.mensualidad_idmensualidad = mensualidad.idmensualidad
JOIN concepto_producto ON concepto_producto.idconcepto_producto = detalle_mensualidad.concepto_producto_idconcepto_producto
JOIN clientes ON clientes.idclientes = mensualidad.clientes_idclientes
JOIN embarcaciones_has_clientes ON embarcaciones_has_clientes.clientes_idclientes = clientes.idclientes
JOIN embarcaciones ON embarcaciones.idembarcaciones = embarcaciones_has_clientes.embarcaciones_idembarcaciones

JOIN rangos_precio_has_embarcaciones ON rangos_precio_has_embarcaciones.embarcaciones_idembarcaciones = embarcaciones.idembarcaciones
JOIN rangos_precio ON rangos_precio.idrangos_precio = rangos_precio_has_embarcaciones.rangos_precio_idrangos_precio
JOIN tarifas ON tarifas.rangos_precio_idrangos_precio = rangos_precio.idrangos_precio
AND tarifas.vigencia <= mensualidad.periodo
AND tarifas.vigencia >= embarcaciones.contrato_fecha

WHERE clientes.idclientes = '${idCliente}'
AND detalle_mensualidad.concepto_producto_idconcepto_producto = '2'
GROUP BY mensualidad.periodo
ORDER BY mensualidad.periodo)
;
`
const cTasas = (idCliente) => `
SELECT mensualidad.idmensualidad AS IDm, detalle_mensualidad.iddetalle_mensualidad AS IDd, null AS IDp, mensualidad.periodo, clientes.idclientes AS IDcl, clientes.apellido, embarcaciones.idembarcaciones AS IDemb, embarcaciones.nombre, concepto_producto.descripcion, MAX(tasas.tasa) as Valor
FROM 
mensualidad

/*JOINS PARA DESPLEGAR LOS DETALLES DE MENSUALIDAD*/
JOIN detalle_mensualidad ON detalle_mensualidad.mensualidad_idmensualidad = mensualidad.idmensualidad
JOIN concepto_producto ON concepto_producto.idconcepto_producto = detalle_mensualidad.concepto_producto_idconcepto_producto
JOIN clientes ON clientes.idclientes = mensualidad.clientes_idclientes
JOIN embarcaciones_has_clientes ON embarcaciones_has_clientes.clientes_idclientes = clientes.idclientes
JOIN embarcaciones ON embarcaciones.idembarcaciones = embarcaciones_has_clientes.embarcaciones_idembarcaciones

/*JOINS PARA CONSEGUIR LA TASA*/
JOIN categorias_has_embarcaciones ON categorias_has_embarcaciones.id_embarcaciones = embarcaciones.idembarcaciones
JOIN categorias ON categorias.idcategorias = categorias_has_embarcaciones.id_categorias
JOIN tasas ON tasas.categoria = categorias.idcategorias
AND tasas.vigencia <= mensualidad.periodo
/* LAS TASAS CAMBIAN UNA VEZ POR AÑO POR ESO HAY QUE LLEVAR LA FECHA DE CONTRATO AL 1ERO DE ENERO*/
AND tasas.vigencia >= DATE(CONCAT(YEAR(embarcaciones.contrato_fecha), '-01-01'))

WHERE clientes.idclientes = '${idCliente}'
AND detalle_mensualidad.concepto_producto_idconcepto_producto = '3'
GROUP BY mensualidad.periodo
ORDER BY mensualidad.periodo;
`

const cPagos = (idCliente) => `
SELECT pago.idpago AS IDp, pago.fecha_de_pago, clientes.idclientes AS IDcl, clientes.apellido, embarcaciones.idembarcaciones AS IDemb, embarcaciones.nombre, 'PAGO', pago.monto
FROM pago
JOIN clientes ON clientes.idclientes = pago.clientes_idclientes
JOIN embarcaciones_has_clientes ON embarcaciones_has_clientes.clientes_idclientes = clientes.idclientes
JOIN embarcaciones ON embarcaciones.idembarcaciones = embarcaciones_has_clientes.embarcaciones_idembarcaciones
WHERE pago.clientes_idclientes = '${idCliente}'
ORDER BY fecha_de_pago;
`

const cEstado = (idCliente) => `
SELECT mensualidad.idmensualidad AS IDm, detalle_mensualidad.iddetalle_mensualidad AS IDd, null AS IDp, mensualidad.periodo, clientes.idclientes AS IDcl, clientes.apellido, clientes.nombre AS clNombre, embarcaciones.idembarcaciones AS IDemb, embarcaciones.nombre, concepto_producto.descripcion,
detalle_mensualidad.valor_contingencia AS Debe, null AS Haber
FROM 
mensualidad
JOIN detalle_mensualidad ON detalle_mensualidad.mensualidad_idmensualidad = mensualidad.idmensualidad
JOIN concepto_producto ON concepto_producto.idconcepto_producto = detalle_mensualidad.concepto_producto_idconcepto_producto
JOIN clientes ON clientes.idclientes = mensualidad.clientes_idclientes
JOIN embarcaciones_has_clientes ON embarcaciones_has_clientes.clientes_idclientes = clientes.idclientes
JOIN embarcaciones ON embarcaciones.idembarcaciones = embarcaciones_has_clientes.embarcaciones_idembarcaciones

WHERE clientes.idclientes = '${idCliente}'
AND detalle_mensualidad.concepto_producto_idconcepto_producto = '1'

UNION

(SELECT mensualidad.idmensualidad AS IDm, detalle_mensualidad.iddetalle_mensualidad AS IDd, null AS IDp, mensualidad.periodo, clientes.idclientes AS IDcl, clientes.apellido, clientes.nombre AS clNombre, embarcaciones.idembarcaciones AS IDemb, embarcaciones.nombre, concepto_producto.descripcion, MAX(tarifas.tarifa), null
FROM 
mensualidad

JOIN detalle_mensualidad ON detalle_mensualidad.mensualidad_idmensualidad = mensualidad.idmensualidad
JOIN concepto_producto ON concepto_producto.idconcepto_producto = detalle_mensualidad.concepto_producto_idconcepto_producto
JOIN clientes ON clientes.idclientes = mensualidad.clientes_idclientes
JOIN embarcaciones_has_clientes ON embarcaciones_has_clientes.clientes_idclientes = clientes.idclientes
JOIN embarcaciones ON embarcaciones.idembarcaciones = embarcaciones_has_clientes.embarcaciones_idembarcaciones

JOIN rangos_precio_has_embarcaciones ON rangos_precio_has_embarcaciones.embarcaciones_idembarcaciones = embarcaciones.idembarcaciones
JOIN rangos_precio ON rangos_precio.idrangos_precio = rangos_precio_has_embarcaciones.rangos_precio_idrangos_precio
JOIN tarifas ON tarifas.rangos_precio_idrangos_precio = rangos_precio.idrangos_precio
AND tarifas.vigencia <= mensualidad.periodo

AND tarifas.vigencia >= embarcaciones.contrato_fecha

WHERE clientes.idclientes = '${idCliente}'
AND detalle_mensualidad.concepto_producto_idconcepto_producto = '2'
GROUP BY mensualidad.periodo
ORDER BY mensualidad.periodo)

UNION

(
SELECT mensualidad.idmensualidad AS IDm, detalle_mensualidad.iddetalle_mensualidad AS IDd, null AS IDp, mensualidad.periodo, clientes.idclientes AS IDcl, clientes.apellido, clientes.nombre AS clNombre, embarcaciones.idembarcaciones AS IDemb, embarcaciones.nombre, concepto_producto.descripcion, MAX(tasas.tasa), null
FROM 
mensualidad

JOIN detalle_mensualidad ON detalle_mensualidad.mensualidad_idmensualidad = mensualidad.idmensualidad
JOIN concepto_producto ON concepto_producto.idconcepto_producto = detalle_mensualidad.concepto_producto_idconcepto_producto
JOIN clientes ON clientes.idclientes = mensualidad.clientes_idclientes
JOIN embarcaciones_has_clientes ON embarcaciones_has_clientes.clientes_idclientes = clientes.idclientes
JOIN embarcaciones ON embarcaciones.idembarcaciones = embarcaciones_has_clientes.embarcaciones_idembarcaciones

JOIN categorias_has_embarcaciones ON categorias_has_embarcaciones.id_embarcaciones = embarcaciones.idembarcaciones
JOIN categorias ON categorias.idcategorias = categorias_has_embarcaciones.id_categorias
JOIN tasas ON tasas.categoria = categorias.idcategorias
AND tasas.vigencia <= mensualidad.periodo
AND tasas.vigencia >= DATE(CONCAT(YEAR(embarcaciones.contrato_fecha), '-01-01'))

WHERE clientes.idclientes = '${idCliente}'
AND detalle_mensualidad.concepto_producto_idconcepto_producto = '3'
GROUP BY mensualidad.periodo
ORDER BY mensualidad.periodo
)
UNION
(

SELECT null AS IDm, null AS IDd, pago.idpago AS IDp, pago.fecha_de_pago, clientes.idclientes AS IDcl, clientes.apellido, clientes.nombre AS clNombre, embarcaciones.idembarcaciones AS IDemb, embarcaciones.nombre, 'PAGO', null, pago.monto
FROM pago
JOIN clientes ON clientes.idclientes = pago.clientes_idclientes
JOIN embarcaciones_has_clientes ON embarcaciones_has_clientes.clientes_idclientes = clientes.idclientes
JOIN embarcaciones ON embarcaciones.idembarcaciones = embarcaciones_has_clientes.embarcaciones_idembarcaciones
WHERE pago.clientes_idclientes = '${idCliente}'
)

ORDER BY periodo;

`

const clientes = {
    todo: todo('clientes'),
    seleccionar : (id) => select('clientes', '*', `idclientes = '${id}'`),
    mails: {
            consultar : obtenerMails,
            insertar : agregarMail,
            eliminar : eliminarMail
            },
    telefonos: {
                consultar: obtenerTelefonos,
                insertar: insertarTelefono,
                eliminar: eliminarTelefono 
                },
    forma_de_pago: {
                    consultar: formaPago,
                    insertar : insertarFormaPago,
                    eliminar: eliminarFormaPago
                    },
    observaciones : {
                    consultar : obtenerObservaciones,
                    insertar: insertarObservacion,
                    eliminar: eliminarObservacion
                    },
    forma_de_facturacion: {
                            consultar: formaFacturacion,
                            insertar: insertarFormaFacturacion,
                            eliminar: eliminarFormaFacturacion
                            },
    cliente,
    listaEmb,
    modificarCliente : cModificarCliente,
    modificarFormaFacturacion : cModificarFormaFacturacion,
    cta_cte : {
        estado: cEstado,
        cuotas : cCuotas,
        tasas : cTasas,
        pagos: cPagos
    }


}

let listaFormasPago = {
    consultar : ()=> 'SELECT * FROM forma_de_pago;'
}

/*
LA CONSULTA PARA INSERTAR TODAS LAS MENSUALIDADES DE UN CLIENTE
DESDE LA FECHA DE CONTRATO DE LA PRIMERA EMBARCACION
EL idcliente en el CROSS JOIN deber ser el mismo id que en en la subquery del WHERE clause
ej: 6.
HAY QUE REVISAR LA SELECCIÓN DE LAS FECHAS PORQUE COMO SELECCIONA >= QUE EL DIA DEL CONTRATO
EL PRIMER MES LO PASA POR ALTO
(EN EL EJEMPLO FECHA CONTRATO ES 31/05/2018 Y PRIMERA MENSUALIDAD 01/06/2018)
RESOLVER ESE PROBLEMA O BUSCAR UNA FORMA NUEVA DE CONSULTAR LAS FECHAS
U OTRA FORMA DE REGISTRAR LOS INGRESOS DE EMBARCACIONES NUEVAS
(POR EJEMPLO SIEMPRE INGRESANDO EL PRIMERO DEL MES QUE SE LE VA A COBRAR)

INSERT INTO mensualidad (periodo, clientes_idclientes)
SELECT primero AS periodo, idcliente AS clientes_idclientes
FROM
primero_de_mes
CROSS JOIN (SELECT '6' AS idcliente) AS CL
WHERE
primero >= (
SELECT MIN(embarcaciones.contrato_fecha)
FROM
embarcaciones
JOIN embarcaciones_has_clientes ON embarcaciones_has_clientes.embarcaciones_idembarcaciones = embarcaciones.idembarcaciones
WHERE
embarcaciones_has_clientes.clientes_idclientes = '6'
)
AND
primero <= DATE(NOW()) ;

CONSULTA PARA INSERTAR EL DETALLE MENSUALIDAD EN UNA MENSUALIDAD DE UN CLIENTE
CON CONCEPTO SALDO INCIAL SIN DATOS EXTRAORDINARIOS
PARA CONSTRUIR DESDE JAVASCRIPT

INSERT INTO detalle_mensualidad (
porcentaje_cuota, porcentaje_interes, mensualidad_idmensualidad, embarcaciones_idembarcaciones,
forma_de_facturacion_idforma_de_facturacion, valor_contingencia, observacion,
concepto_producto_idconcepto_producto
)
VALUES (
'100', '0', '${mensualidadId}', '${embarcacionId}',
'${formaDeFacturacionId}', '${valor ? valor : null}', '${observacion ? observacion : null}',
'1'  
)
;


 */





module.exports = {
    tareas,
    embarcaciones,
    clientes,
    listaFormasPago
}
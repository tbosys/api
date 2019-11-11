/* eslint-disable linebreak-style */
var moment = require("moment");

exports.up = function(knex) {
  return knex.schema
    .alterTable("lineaPagoDocumento", function(table) {
      table.integer("diasCredito");
    })
    .then(() => {
      return knex.table("producto").update({ porcentajeComision: 2 });
    })
    .then(() => {
      return knex
        .table("lineaPagoDocumento")
        .update({ diasCredito: knex.raw("DATEDIFF(lineaPagoDocumento.fecha,documento.fecha)") })
        .innerJoin("documento", "documento.id", "lineaPagoDocumento.documentoId");
    })
    .then(() => {
      return knex
        .table("lineaPagoDocumento")
        .update({ "lineaPagoDocumento.ownerId": knex.raw("cliente.ownerId") })
        .innerJoin("documento", "documento.id", "lineaPagoDocumento.documentoId")
        .innerJoin("cliente", "cliente.id", "documento.clienteId")
        .where("lineaPagoDocumento.fecha", ">=", "2019-04-01");
    })
    .then(async () => {
      var pagos = await knex
        .table("lineaPagoDocumento")
        .select()
        .where("fecha", ">=", "2019-04-01");

      var movimientos = await knex
        .table("movimientoInventario")
        .select("movimientoInventario.*", "producto.porcentajeComision")
        .innerJoin("producto", "producto.id", "movimientoInventario.productoId")
        .where("fecha", ">=", "2019-04-01")
        .where("tipo", "IN", ["FA", "NC", "ND"]);

      var count = movimientos.length - 1;
      while (count > -1) {
        var movimiento = movimientos[count];
        var comision = movimiento.porcentajeComision / 100;
        if (movimiento.productoId)
          await knex.table("comisionHistorico").insert({
            fecha: moment().format("YYYY-MM-DD"),
            tipo: movimiento.tipo,
            ownerId: movimiento.ownerId,
            monto: parseInt(comision * movimiento.subTotalConDescuento * 100) / 100,
            movimientoInventarioId: movimiento.id
          });
        count--;
      }

      count = pagos.length - 1;
      while (count > -1) {
        var lineaPago = pagos[count];
        var comisionPago = 0;

        if (lineaPago.diasCredito >= 75) comisionPago = -2;
        else if (lineaPago.diasCredito <= 50) comisionPago = 0.5;

        if (comisionPago != 0 && lineaPago.plazoDocumento > 2) {
          await knex.table("comisionHistorico").insert({
            fecha: moment().format("YYYY-MM-DD"),
            tipo: "PA" + (comisionPago > 0 ? "+" : "-"),
            ownerId: lineaPago.ownerId,
            monto: parseInt((comisionPago / 100) * lineaPago.monto * 100) / 100,
            lineaPagoDocumentoId: lineaPago.id
          });
        }
        count--;
      }

      return true;
    });
};

exports.down = function(knex) {
  return knex.schema
    .alterTable("lineaPagoDocumento", function(table) {
      table.dropColumn("diasCredito");
    })
    .then(() => {
      return knex.table("comisionHistorico").delete();
    });
};

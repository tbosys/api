var QueryAction = require("../../operation/baseQueryAction");
var moment = require("moment-timezone");

var QueryAction = require("../../operation/baseQueryAction");
var Errors = require("../../errors");
var moment = require("moment-timezone");

module.exports = class RegistroRecentQuery extends QueryAction {
  get secure() {
    return false;
  }
  async query(body) {
    var w1 = moment()
      .startOf("week")
      .add(-12, "week")
      .format("YYYY-MM-DD");

    var query = this.knex
      .table("movimientoInventario")
      .select("producto.name")
      .select("producto.familia")
      .select("producto.subFamilia")
      .select("producto.id as productoId")
      .select("producto.id as productoId")
      .sum("movimientoInventario.cantidad as cantidad")
      .avg("movimientoInventario.descuentoUnitario as descuento")
      .avg("movimientoInventario.precio as precio")
      .innerJoin("producto", "producto.id", "movimientoInventario.productoId")
      .where("fecha", ">=", w1)
      .groupBy("producto.name", "producto.id")
      .orderBy("cantidad", "desc");

    body.filters.forEach(filter => {
      query = query.where(filter[0], filter[1], filter[2]);
    });
    var stats = await query;

    var productoMap = {};
    var productoIds = stats.map(item => {
      productoMap[item.productoId] = item;
      return item.productoId;
    });

    var queryLastSale = this.knex
      .table("movimientoInventario")
      .select("movimientoInventario.productoId")
      .max("movimientoInventario.fecha as fecha")
      .where("fecha", ">=", w1)
      .where("productoId", "IN", productoIds)
      .groupBy("movimientoInventario.productoId");

    body.filters.forEach(filter => {
      queryLastSale = queryLastSale.where(filter[0], filter[1], filter[2]);
    });

    var lastSales = await queryLastSale;
    lastSales.forEach(item => {
      if (productoMap[item.productoId]) productoMap[item.productoId].ultimaCompraFecha = moment(item.fecha);
      productoMap[item.productoId].ultimaCompra = moment(item.fecha).diff(moment(), "days") + " días";
    });

    var results = Object.values(productoMap);
    results.sort((a, b) => {
      if (a.ultimaCompraFecha < b.ultimaCompraFecha) return -1;
      else if (a.ultimaCompraFecha > b.ultimaCompraFecha) return 1;
      else return 0;
    });

    return results;

    var documentosPorMes = this.knex.raw(
      ` SELECT producto.name as name, '1' AS week,sum(cantidad) AS cantidad 
    FROM movimientoInventario
    inner join producto on producto.id = movimientoInventario.productoId
    WHERE fecha >= "${w1}"
      AND fecha <= CURDATE() 
      AND movimientoInventario.tipo IN ("FA","NC","ND")
      group by producto.name as name
  UNION ALL
    SELECT producto.name as name,'2' AS week, sum(cantidad) AS totalConDescuento 
    FROM movimientoInventario
    inner join producto on producto.id = movimientoInventario.productoId
    WHERE fecha >= "${w2}"
      AND fecha < "${w1}"
      AND movimientoInventario.tipo IN ("FA","NC","ND")
      group by producto.name as name
      UNION ALL
    SELECT productoId as productoId,'3' AS week, sum(cantidad) AS totalConDescuento 
    FROM movimientoInventario
    inner join producto on producto.id = movimientoInventario.productoId
    AND movimientoInventario.tipo IN ("FA","NC","ND")
    WHERE fecha >= "${w3}"
      AND fecha < "${w2}" group by productoId;`
    );
  }
};

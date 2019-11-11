var BaseAction = require("../../operation/baseCreateAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");

var moment = require("moment-timezone");

module.exports = class DefaultUpdateAction extends BaseAction {
  get secure() {
    return false;
  }
  execute(table, body) {
    this.table = table;
    this.body = body;
    return this.aplicar(table, body);
  }

  async aplicar(table, body) {
    var date6 = moment()
      .add(-7, "months")
      .startOf("month")
      .format("YYYY-MM-DD");
    var date0 = moment()
      .add(-1, "months")
      .endOf("month")
      .format("YYYY-MM-DD");

    var results = await this.knex
      .table("movimientoInventario")
      .sum("cantidad as cantidad")
      .select(this.knex.raw("Month(fecha) as fecha"))
      .select("productoId")
      .where("fecha", ">=", date6)
      .where("fecha", "<=", date0)
      .where("tipo", "IN", ["FA", "NC", "ND"])
      .groupByRaw("productoId, MONTH(fecha)");

    var map = {};
    results.forEach(venta => {
      if (!map[venta.productoId]) map[venta.productoId] = { list: [], avg: 0, productoId: venta.productoId };
      map[venta.productoId].list.push(venta.cantidad);
    });

    var ventas = Object.values(map);
    ventas.forEach(venta => {
      var total = 0;

      venta.list.forEach(line => {
        total += line;
      });
      venta.avg = parseInt(((total / 7) * 1000) / 1000);
    });

    var index = ventas.length - 1;
    while (index > 0) {
      var venta = ventas[index];
      await this.knex
        .table("producto")
        .update({ promedioVentas: venta.avg })
        .where("id", venta.productoId);
      index--;
    }
    return true;
  }
};

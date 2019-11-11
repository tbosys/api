var BaseAction = require("../../operation/baseAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");

var moment = require("moment-timezone");

module.exports = class DefaultUpdateAction extends BaseAction {
  async execute(table, body) {
    this.table = table;
    this.body = body;

    var currentPrecio = await this.query("queryPrecio")
      .table("precio")
      .select()
      .where("productoId", body.productoId)
      .where("grupoId", body.grupoId)
      .first();
    if (currentPrecio) {
      currentPrecio.precio = body.precio;
      await this.getActionAndInvoke(this.table, "update", currentPrecio);
    } else {
      await this.getActionAndInvoke(this.table, "create", {
        productoId: body.productoId,
        grupoId: body.grupoId,
        name: body.name,
        precio: body.precio
      });
    }

    await this.getActionAndInvoke("priceListHistory", "create", {
      productoId: body.productoId,
      grupoId: body.grupoId,
      precio: body.precio,
      descuento: body.descuento,
      precioDelta: body.precioDelta
    });

    return true;
  }
};

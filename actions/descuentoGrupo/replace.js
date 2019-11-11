var BaseAction = require("../../operation/baseAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");

var moment = require("moment-timezone");

module.exports = class DefaultUpdateAction extends BaseAction {
  async execute(table, body) {
    this.table = table;
    this.body = body;

    var currentDescuento = await this.query("queryDescuento")
      .table(this.table)
      .select()
      .where("productoId", body.productoId)
      .where("grupoId", body.grupoId)
      .first();
    if (currentDescuento) {
      currentDescuento.descuento = body.descuento;
      await this.getActionAndInvoke(this.table, "update", currentDescuento);
    } else {
      await this.getActionAndInvoke(this.table, "create", {
        productoId: body.productoId,
        grupoId: body.grupoId,
        name: body.name,
        descuento: body.descuento
      });
    }

    return true;
  }
};

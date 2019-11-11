var BaseAction = require("../../operation/baseAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");
var moment = require("moment-timezone");

module.exports = class Reintentar extends BaseAction {

  execute(table, body) {
    this.table = table;
    this.body = body;
    return this.marcar(table, body);
  }

  async marcar(table, body) {

    var inventario = await this.knex.table("producto")
      .innerJoin("costoHistorico", "costoHistorico.id", "producto.costoHistoricoId")
      .select(this.knex.raw("sum(producto.inventario * costoHistorico.costo) as total"))
      .first()

    var saldo = await this.knex.table("saldo")
      .sum("total as total")
      .first()

    var saldoCxP = await this.knex.table("facturaCxP")
      .sum("saldo as total")
      .first()

    await this.knex.table("registroContinuo").insert({
      fecha: moment().format("YYYY-MM-DD"),
      tipo: "saldo",
      monto: saldo.total || 0
    });

    await this.knex.table("registroContinuo").insert({
      fecha: moment().format("YYYY-MM-DD"),
      tipo: "inventario",
      monto: inventario.total || 0
    });

    await this.knex.table("registroContinuo").insert({
      fecha: moment().format("YYYY-MM-DD"),
      tipo: "saldoCxP",
      monto: saldoCxP.total || 0
    });

    return { inventario, saldo, saldoCxP }

  }

}
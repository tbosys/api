var BaseAction = require("../../operation/baseCreateAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");

module.exports = class CostoHistoricoCreate extends BaseAction {

  async preInsert() {

    var productoId = this.body.productoId;
    var producto = await this.knex.table("producto").select(["inventario", "costoHistoricoId"]).where({ id: productoId }).first();
    var costoHistoricoAnterior = await this.knex.table(this.table).select("costo").where({ id: producto.costoHistoricoId }).first();

    var cantidadIngresado = this.body.cantidad
    delete this.body.cantidad;

    var costoAnterior = costoHistoricoAnterior ? costoHistoricoAnterior.costo : 0;
    var costo = 0;

    this.body.inventarioInicial = producto.inventario || 0;
    this.body.inventarioIngresado = cantidadIngresado;

    if (costoAnterior > 0) {
      var inventarioFinal = Number.dineroNumber(cantidadIngresado, producto.inventario, "plus");
      this.body.inventarioFinal = inventarioFinal;
      var valorActual = Number.dineroNumber(producto.inventario, costoAnterior, "times");
      var valorIngreso = Number.dineroNumber(this.body.costoIngresado, cantidadIngresado, "times");

      var valorFinal1 = Number.dineroNumber(valorActual, valorIngreso, "plus");
      var valorFinal = Number.dineroNumber(valorFinal1, inventarioFinal, "dividedBy");

      this.body.costo = valorFinal;
      this.body.costoAnterior = costoAnterior;
    }
    else {
      this.body.costo = this.body.costoIngresado;
      this.body.costoAnterior = 0;
    }
  }

  async postInsert() {
    this.body.id = this.results[0];
    this.results = this.body;
    var productoId = this.body.productoId;
    await this.knex.table("producto").update({ costoHistoricoId: this.body.id }).where({ id: productoId });
    return;
  }

}
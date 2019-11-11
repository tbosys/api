var BaseAction = require("../../operation/baseDestroyAction");

module.exports = class DefaultUpdateFieldAction extends BaseAction {
  async preDestroy() {
    var boletas = await this.knex
      .table(this.table)
      .select()
      .whereIn("id", this.body.ids);

    var movimientos = [];
    boletas.forEach(boleta => {
      var movimientosInBoleta = JSON.parse(boleta.movimientoInventario || "[]");
      movimientos = movimientos.concat(movimientosInBoleta);
    });

    var index = movimientos.length - 1;
    while (index > -1) {
      let movimiento = movimientos[index];
      if (movimiento.movimientoInventarioOriginalId)
        await this.knex
          .table("movimientoInventario")
          .update({ activo: true })
          .where("id", movimiento.movimientoInventarioOriginalId);
      index--;
    }
    return true;
  }
};

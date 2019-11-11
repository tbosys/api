var BaseAction = require("../../operation/baseAction");

const exactMath = require("exact-math");

var moment = require("moment-timezone");

module.exports = class DefaultUpdateAction extends BaseAction {
  async execute(table, body) {
    this.table = table;
    this.body = body;

    var ordenOwner = this.context.userMap[this.body.ownerId] || {};

    if (ordenOwner.comisiona) {
      var productoMap = await this.getComisiones();

      let comisionPromises = this.createComisiones(this.body.movimientos, productoMap)
        .filter(response => response != null)
        .map(comision => {
          return this.getActionAndInvoke("comisionHistorico", "create", comision);
        });
      return Promise.all(comisionPromises);
    }
    return {};
  }

  async getComisiones() {
    let productoMap = {};

    var knex = this.query("getComisiones");

    let productos = await knex.table("producto").select(["porcentajeComision", "id"]);

    productos.forEach(item => {
      productoMap[item.id] = item;
    });
    return productoMap;
  }

  createComisiones(movimientos, productoMap) {
    return movimientos.map(movimiento => {
      if (!movimiento.productoId) return null;
      var comision = productoMap[movimiento.productoId].porcentajeComision || 0;
      if (!comision || comision == 0) return null;
      return {
        fecha: moment().format("YYYY-MM-DD"),
        tipo: movimiento.tipo,
        ownerId: movimiento.ownerId,
        monto: exactMath.formula(`${movimiento.subTotalConDescuento}*(${comision}/100)`, { maxDecimal: 5 }),
        movimientoInventarioId: movimiento.id
      };
    });
  }
};

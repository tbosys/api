var QueryAction = require("../../operation/baseQueryAction");
var Errors = require("../../errors");
var moment = require("moment-timezone");

module.exports = class PagoCreateAction extends QueryAction {
  async query(body) {
    var saldos = await this.knex(this.table)
      .select(["proveedor.name as __proveedorId", "facturaCxP.*"])
      .leftJoin("proveedor", "facturaCxP.proveedorId", "proveedor.id")
      .where({ "facturaCxP.proveedorId": body.id })
      .where("facturaCxP.saldo", "!=", 0)
      .where("facturaCxP.estado", "=", "por pagar");

    saldos.forEach(saldo => {
      if (saldo.fechaFactura) saldo.plazoActual = moment().diff(moment(saldo.fechaFactura), "days");
    });

    saldos.sort((a, b) => {
      if (a.fechaFactura == b.fechaFactura) return 0;
      if (a.fechaFactura > b.fechaFactura) return -1;
      return 1;
    });

    return saldos;
  }
};

var BaseAction = require("../../operation/baseCreateAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");

var moment = require("moment-timezone");

module.exports = class OrdenAplicarAction extends BaseAction {
  execute(table, body) {
    this.table = table;
    this.body = body;
    return this.aplicar(table, body);
  }

  async aplicar(table, body) {
    var clienteIds = [];
    var plazo = 0;

    var id = this.enforceSingleId(body);
    await this.enforceStatus(body, ["por aplicar", "por proformar", "por revisar"]);

    var orden = await this.knex
      .table(table)
      .select(["estado", "id", "clienteId", "plazo", "especial", "total"])
      .where("id", id)
      .first();

    var cliente = await this.knex
      .table("cliente")
      .select(["creditoPlazo", "id", "aprobacionManual", "zonaId", "creditoLimite", "cedula"])
      .where("id", orden.clienteId)
      .first();

    if (orden.plazo == 0 && cliente.creditoPlazo > 0)
      throw new Errors.VALIDATION_ERROR("El cliente es de credito, no se puede facturar de contado");

    if (!cliente.cedula)
      throw new Errors.VALIDATION_ERROR("El cliente debe de tener cedula");

    if (orden.total > 3000000) cliente.aprobacionManual = true;

    var saldos = await this.knex("saldo")
      .select(["fecha", "total"])
      .where({ tipo: "FA", clienteId: orden.clienteId });

    const saldoActual = await saldos.reduce((acc, factura) => acc + factura.total, 0);
    var exceedSaldo = true;
    try {
      var saldoWithOrden = (saldoActual || 0) + orden.total;
      var creditoLimit = cliente.creditoLimite || 1000000000;
      if (orden.plazo == 0) exceedSaldo = false;
      else if (saldoWithOrden < creditoLimite) exceedSaldo = false;
    } catch (e) {}

    var hasSaldoVencido = false;
    saldos.forEach(saldo => {
      saldo.plazo = parseInt(moment().diff(moment(saldo.fecha), "days"));
      if (saldo.plazo > cliente.creditoPlazo + 2) hasSaldoVencido = true;
    });

    var delta = { estado: "por imprimir", zonaId: cliente.zonaId };

    if (orden.plazo != 0 && (hasSaldoVencido || cliente.aprobacionManual || exceedSaldo))
      delta.estado = "por aprobar";
    if (orden.especial) delta.estado = "por aprobar";

    var result = await this.knex
      .table(table)
      .update(delta)
      .where("id", orden.id);

    var indexIds = 0;
    while (indexIds < body.ids.length) {
      await this.saveAudit(body.ids[indexIds], "aplicar", delta);
      indexIds++;
    }

    if (result.length == 0) throw new Errors.UPDATE_WITHOUT_RESULT(this.table, body.id);
    return {};
  }
};

var BaseAction = require("../../operation/baseAction");
var moment = require("moment-timezone");
const Errors = require("../../errors");

class ImprimirOrden extends BaseAction {
  async execute(table, body) {
    this.table = table;
    this.body = body;

    var id = this.enforceSingleId(body);
    await this.enforceStatus(body, "por aprobar");

    let nota = await this.query("getNota")
      .table(table)
      .select([
        "nota.*",
        "cliente.tipoCedula as clienteTipoCedula",
        "cliente.vendedorId as clienteVendedorId",
        "cliente.cedula as clienteCedula",
        "cliente.name as clienteName"
      ])
      .innerJoin("cliente", "cliente.id", "nota.clienteId")
      .where("nota.id", id)
      .forUpdate()
      .first();

    if (!nota.descripcion) throw new Errors.VALIDATION_ERROR("La nota necesita descripion");

    let cliente = this.knex
      .table("cliente")
      .select("id", "ownerId")
      .where("id", nota.clienteId)
      .first();

    nota.ownerId = cliente.ownerId || this.user.id;

    let documento = await this.getActionAndInvoke("documento", "createNota", { nota: nota });

    var delta = {
      id: nota.id,
      ownerId: nota.ownerId,
      estado: "archivado",
      documentoId: documento.id,
      _forceUpdate: true
    };
    await this.getActionAndInvoke(table, "update", delta);

    await this.saveAudit(nota.id, "aprobar", delta);

    return { success: true };
  }
}

module.exports = ImprimirOrden;

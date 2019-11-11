var BaseAction = require("../../operation/baseAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");
var InvokeSign = require("../../apiHelpers/invokeSign");

module.exports = class Reintentar extends BaseAction {
  execute(table, body) {
    this.table = table;
    this.body = body;
    return this.reintentar(table, body);
  }

  async reintentar(table, body) {
    var id = this.enforceSingleId(body);

    var firma = this.context.config;
    var registro = await this.knex
      .table("registroElectronico")
      .select(["clave", "tipoId"])
      .where({ id: id })
      .first();

    return InvokeSign({
      documentoId: registro.tipoId,
      account: this.user.account,
      documentoClave: registro.clave,
      cedula: firma.cedula,
      namespaceId: process.env.NODE_ENV
    });
  }
};

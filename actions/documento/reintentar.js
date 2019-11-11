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

    var documento = await this.knex
      .table("documento")
      .where({ id: id })
      .first();

    await this.knex
      .table("orden")
      .update({ estado: "por archivar" })
      .where("id", documento.ordenId);

    return InvokeSign({
      documentoId: documento.id,
      ordenId: documento.ordenId,
      account: this.user.account,
      documentoClave: documento.clave,
      cedula: firma.cedula,
      user: { name: this.user.name, email: this.user.email, id: this.user.id },
      namespaceId: process.env.NODE_ENV
    });
  }
};

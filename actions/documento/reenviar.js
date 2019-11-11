var BaseAction = require("../../operation/baseAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");
var InvokeLambda = require("../../apiHelpers/invokeLambda");

module.exports = class Reenviar extends BaseAction {
  execute(table, body) {
    this.table = table;
    this.body = body;
    return this.reenviar(body);
  }

  async reenviar(body) {
    var id = this.enforceSingleId(body);

    var firma = this.context.config;
    var cedulaS3 = `${firma.cedula}_${process.env.NODE_ENV}`;

    var documento = await this.knex
      .table("documento")
      .where({ id: id })
      .first();

    var cliente = await this.knex
      .table("cliente")
      .where({ id: documento.clienteId })
      .first();

    return InvokeLambda("hacienda","step-notify",{
      documentoId: documento.id,
      ordenId: documento.ordenId,
      account: this.user.account,
      documentoClave: documento.clave,
      clienteId: cliente.id,
      __clienteId: cliente.name,
      cedula: firma.cedula,
      cedulaS3: cedulaS3,
      user: { name: this.user.name, email: this.user.email, id: this.user.id },
      namespaceId: process.env.NODE_ENV
    });
  }
};




const Dinero = require("dinero.js");
Dinero.globalLocale = "es-CR";
Dinero.defaultPrecision = 5;

var BaseAction = require("../../operation/baseUpdateAction");

module.exports = class HaciendaCheck extends BaseAction {
  async execute(table, body) {
    this.table = table;
    this.body = body;

    var delta = {
      id: body.id,
      estado: "archivado",
      _forceUpdate: true
    };
    if (body.respuestaXml) delta.respuestaXml = body.respuestaXml;
    if (body.respuestaHacienda) delta.respuestaHacienda = body.respuestaHacienda;

    await this.getActionAndInvoke(table, "update", delta);

    var registro = await this.knex
      .table(table)
      .select()
      .where("id", body.id)
      .first();

    await this.getActionAndInvoke("gasto", "createFromRegistro", registro);

    return body;
  }
};

const Dinero = require("dinero.js");
Dinero.globalLocale = "es-CR";
Dinero.defaultPrecision = 5;

var BaseAction = require("../../operation/baseUpdateAction");

module.exports = class DefaultUpdateAction extends BaseAction {
  async execute(table, body) {
    this.table = table;
    this.body = body;

    var delta = {
      id: body.id,
      estado: body.estado,
      _forceUpdate: true
    };
    if (body.respuestaXml) delta.respuestaXml = body.respuestaXml;
    if (body.respuestaHacienda) delta.respuestaHacienda = body.respuestaHacienda;
    await this.getActionAndInvoke(table, "update", delta);

    return body;
  }
};

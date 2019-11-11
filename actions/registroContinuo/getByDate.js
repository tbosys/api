var QueryAction = require("../../operation/baseQueryAction");
var Errors = require("../../errors");
var moment = require("moment-timezone");

module.exports = class PagoCreateAction extends QueryAction {

  async query(body) {

    var registros = await this.knex("registroContinuo").select()
      .where("fecha", moment(body.date).format("YYYY-MM-DD"))

    var registroMap = {};

    registros.forEach((registro) => {
      if (!registroMap[registro.createdAt]) registroMap[registro.createdAt] = [];
      registroMap[registro.createdAt].push(registro);
    })

    return Object.keys(registroMap).map((key) => { return { fecha: key, montos: registroMap[key] } });

  }

}

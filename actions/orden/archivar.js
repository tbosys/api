var BaseAction = require("../../operation/baseCreateAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");

var moment = require("moment-timezone");

module.exports = class ArchivarOrden extends BaseAction {
  execute(table, body) {
    this.table = table;
    this.body = body;
    return this.archivar(table, body);
  }

  async archivar(table, body) {
    return this.knex
      .table("orden")
      .update({ estado: "archivado" })
      .where({ estado: "por archivar" });
  }
};

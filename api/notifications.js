const Errors = require("../errors");
var BaseOperation = require("../operation/baseOperation");
var Security = require("../apiHelpers/security");
const moment = require("moment");

class ApiOperation extends BaseOperation {
  get table() {
    return "";
  }

  get multiTenantObject() {
    return true;
  }

  async documentos() {
    var docs = await this.knex
      .table("documento")
      .select(["clave", "estado", "documento.createdAt", "cliente.name as cliente"])
      .innerJoin("cliente", "cliente.id", "documento.clienteId")
      .where("documento.createdAt", ">", moment().format("YYYY-MM-DD 00:00:01"));

    docs.forEach(item => {
      item.tipo = "venta";
    });
    return docs;
  }
}

module.exports = ApiOperation;

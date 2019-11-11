const Errors = require("../errors");

var BaseOperation = require("../operation/baseOperation");
var Parser = require("../apiHelpers/xmlParser");
var BodyHelper = require("../operation/bodyHelper");
var Security = require("../apiHelpers/security");

class ApiOperation extends BaseOperation {
  get table() {
    return "costoHistoricoValor";
  }

  async metadata(body) {
    var metadata = this.getMetadata();
    var item = null;
    var recent = null;

    if (body.id && parseInt(body.id) >= 0) item = await this.one(body);
    else if (body.inProgress) recent = await this.query(this.getQueryForInProgress() || { inProgress: true });
    else if (body.relatedTo) recent = await this.query({ filters: [[body.relatedTo, "=", body.relatedId]] });
    else if (body.filters) recent = await this.query(body);

    metadata.count = 0;
    metadata.user = this.user;
    metadata.item = item;
    metadata.recent = recent;
    return Promise.resolve(metadata);
  }

  get multiTenantObject() {
    return true;
  }

  async _query(body) {
    Security.checkQuery(this.table, this.user);

    return this.knex("producto")
      .select([
        "producto.id",
        "producto.marca",
        "producto.inventario",
        "costoHistorico.costo",
        "producto.name"
      ])
      .select(this.knex.raw("(?? * ??) as valor", ["producto.inventario", "costoHistorico.costo"]))
      .innerJoin("costoHistorico", "costoHistorico.id", "producto.costoHistoricoId")
      .where("producto.inventario", ">", 0);
  }
}

module.exports = ApiOperation;

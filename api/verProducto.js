
const Errors = require("../errors");

var BaseOperation = require("../operation/baseOperation");
var Parser = require('../apiHelpers/xmlParser');
var BodyHelper = require("../operation/bodyHelper");
var Security = require("../apiHelpers/security");


class ApiOperation extends BaseOperation {


  get table() {
    return "verProducto";
  }

  async metadata(body) {
    var metadata = this.getMetadata();
    var item = null;
    var recent = null;

    if (body.id && (parseInt(body.id) >= 0)) item = await this.one(body);
    else if (body.inProgress) recent = await this.query(this.getQueryForInProgress() || { inProgress: true })
    else if (body.relatedTo) recent = await this.query({ filters: [[body.relatedTo, "=", body.relatedId]] })
    else if (body.filters) recent = await this.query(body);

    metadata.count = 0;

    metadata.item = item;
    metadata.recent = recent;
    return Promise.resolve(metadata);
  }

  get multiTenantObject() {
    return true;
  }

  async _query(body) {
    Security.checkQuery(this.table, this.user);
    
    var knexOperation = this.knex("producto");
    knexOperation.select(["producto.id", "producto.familia","producto.categoria", "producto.inventario", "costoHistorico.costo", "producto.name","descuentoGrupo.descuento","precio.precio"])
      .select(this.knex.raw('(?? - (?? * ?? / 100)) as precioNeta', ['precio.precio','precio.precio', 'descuentoGrupo.descuento']))
      .select(this.knex.raw('((?? - (?? * ?? / 100))-??)/(?? - (?? * ?? / 100)) as utilidad', ['precio.precio','precio.precio', 'descuentoGrupo.descuento','costoHistorico.costo','precio.precio','precio.precio', 'descuentoGrupo.descuento']))
      .innerJoin("costoHistorico", "costoHistorico.id", "producto.costoHistoricoId")
      .innerJoin("precio", "precio.productoId", "producto.id")
      .innerJoin("descuentoGrupo", "descuentoGrupo.productoId", "producto.id")
      .where("producto.activo", "=", true)
      .where("descuentoGrupo.name", "=", "mayoreo")
      .where("precio.name", "=", "mayoreo")

    if(body.filters){
      body.filters.forEach((filter) => {
        var parts = filter[0].split(".");
        var regex = /verProducto/gi; 
        filter[0] = filter[0].replace(regex, 'producto'); 
        var key = parts[1] || parts[0];
        var column = this._metadata.properties[key];
        if (column && column.select) knexOperation.whereRaw(`${column.select} ${filter[1]} ?`, filter[2]);
        knexOperation.where(filter[0], filter[1], filter[2]);
      });
    }
    return knexOperation;
  }

}

module.exports = ApiOperation;
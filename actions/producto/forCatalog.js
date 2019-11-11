var QueryAction = require("../../operation/baseQueryAction");
var Errors = require("../../errors");
var moment = require("moment-timezone");

module.exports = class PagoCreateAction extends QueryAction {
  get secure() {
    return false;
  }
  async query(body) {
    var productos = await this.knex
      .table("producto")
      .select("producto.*", "productoGrupoList.productoId as inCatalog")
      .leftJoin("productoGrupoList", "productoGrupoList.productoId", "producto.id");

    var productoMap = {};
    productos.forEach(producto => {
      if (!producto.inCatalog) producto.orhpan = true;
      if (!productoMap[producto.id]) productoMap[producto.id] = producto;
    });

    return Object.values(productoMap);
  }
};

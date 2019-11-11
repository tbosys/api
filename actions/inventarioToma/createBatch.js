var BaseAction = require("../../operation/baseAction");

module.exports = class Reintentar extends BaseAction {
  async execute(table, body) {
    var productos = await this.knex.table("producto").select("id", "inventario");
    var productoMap = {};
    productos.forEach(item => {
      productoMap[item.id] = item.inventario;
    });

    var promises = body.map(item => {
      return this.knex.table("inventarioToma").insert({
        inventario: productoMap[item.productoId],
        productoId: item.productoId,
        toma: item.toma,
        diferencia: item.toma - productoMap[item.productoId],
        ok: productoMap[item.productoId] == item.toma,
        createdBy: this.user.name
      });
    });
    return Promise.all(promises);
  }
};

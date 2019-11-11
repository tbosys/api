var BaseAction = require("../../operation/baseCreateAction");

module.exports = class DefaultCreateAction extends BaseAction {
  async preInsert() {
    this.body.inventario = 0;
    return true;
  }

  async postInsert() {
    this.body.id = this.results[0];
    this.results = this.body;

    var retail = await this.knex
      .table("grupo")
      .select()
      .where("name", "retail")
      .first();
    return this.getActionAndInvoke("precio", "create", {
      productoId: this.body.id,
      precio: 1,
      name: retail.name,
      grupoId: retail.id
    });
  }
};

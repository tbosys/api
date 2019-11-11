var BaseAction = require("../../operation/baseCreateAction");

module.exports = class IncrementInventario extends BaseAction {
  async execute(table, body) {
    await this.knex.table("consecutivo").increment("consecutivoFactura");

    return await this.knex
      .table("consecutivo")
      .select()
      .first()
      .forUpdate();
  }
};

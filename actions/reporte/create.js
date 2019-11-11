var BaseAction = require("../../operation/baseCreateAction");

module.exports = class CreateRporte extends BaseAction {
  async preInsert() {
    var existingReport = await this.knex
      .table(this.table)
      .where("name", this.body.name)
      .where("table", this.body.table)
      .first();
    if (existingReport)
      await this.knex
        .table(this.table)
        .delete()
        .where("name", this.body.name)
        .where("table", this.body.table);
  }
};

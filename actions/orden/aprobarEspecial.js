var BaseAction = require("../../operation/baseCreateAction");

module.exports = class DefaultUpdateAction extends BaseAction {
  async execute(table, body) {
    this.table = table;
    this.body = body;
    var delta = { estado: body.estado };

    var result = await this.knex
      .table(table)
      .update(delta)
      .whereIn("id", body.ids);

    if (result.length == 0) throw new this.Errors.UPDATE_WITHOUT_RESULT(this.table, body.id);
    return result;
  }
};

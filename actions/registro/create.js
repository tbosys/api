var BaseAction = require("../../operation/baseCreateAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");

module.exports = class DefaultCreateAction extends BaseAction {

  execute(table, body) {
    return this.create(table, body);
  }

  async create(table, body) {
    try {
      this.validate(table, body);

      body.createdBy = this.user.name;

      var result = await this.knex.table(table).insert(body)
      body.id = result[0];
      return body;
    } catch (e) {
      if (e.code == "ER_DUP_ENTRY") throw new Errors.DUPLICATE_ERROR(e, body);
      throw e;
    }
  }

}
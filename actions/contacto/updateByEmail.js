var BaseAction = require("../../operation/baseAction");

class UpdateByEmail extends BaseAction {
  async execute(table, body) {
    this.table = table;
    this.body = body;

    await this.query("contacto")
      .table(table)
      .update(this.body)
      .where("email", body.email);
    return { success: true };
  }
}

module.exports = UpdateByEmail;

var BaseAction = require("../../operation/baseCreateAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");

module.exports = class DefaultCreateAction extends BaseAction {
  async preInsert() {
    var ordenId = this.body.ordenId;
    await this.knex("ordenLinea")
      .del()
      .where({ ordenId: ordenId });
    var keys = Object.keys(this.body);
    keys.forEach(key => {
      if (key.indexOf("_") == 0) delete this.body[key];
      if (!this.metadata.properties[key]) delete this.body[key];
    });
    return true;
  }
};

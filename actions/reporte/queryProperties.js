var QueryAction = require("../../operation/baseQueryAction");
var Errors = require("../../errors");
var moment = require("moment-timezone");

module.exports = class RegistroRecentQuery extends QueryAction {
  async query(body) {
    if (!body.item || !body.item.table) return [];
    var schema = require("../../" + "schema/" + body.item.table);

    return Object.keys(schema.properties).map(itemKey => {
      return { id: itemKey, name: schema.properties[itemKey].title, metadata: schema.properties[itemKey] };
    });
  }
};

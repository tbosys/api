
const Errors = require("../errors");
const moment = require("moment");

var BaseOperation = require("../operation/baseOperation");

class ApiOperation extends BaseOperation {

  get table() {
    return "journal";
  }

  get multiTenantObject() {
    return true;
  }


  async postMetadata(metadata) {
    var last = await this.knex.table("journal").select("name").orderBy("createdAt", "desc").first();
    if (!last) last = { name: `AS-0-${moment().format("YYYY/MM/DD")}` }
    var parts = last.name.split("-");
    parts[1] = parseInt(parts[1]) + 1;
    metadata.properties.name.default = parts.join("-");
    return metadata;
  }

}

module.exports = ApiOperation;
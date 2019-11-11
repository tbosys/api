const Errors = require("../errors");
var BaseOperation = require("../operation/baseOperation");
var Security = require("../apiHelpers/security");

class ApiOperation extends BaseOperation {
  get table() {
    return "clienteStats";
  }

  get schema() {
    return "clienteStats";
  }

  get multiTenantObject() {
    return true;
  }
}

module.exports = ApiOperation;

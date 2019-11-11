
const Errors = require("../errors");

var BaseOperation = require("../operation/baseOperation");
var Parser = require('../apiHelpers/xmlParser');
var BodyHelper = require("../operation/bodyHelper");
const moment = require("moment");


class ApiOperation extends BaseOperation {


  get table() {
    return "facturaCxP";
  }

  get multiTenantObject() {
    return true;
  }


  async postQuery(items, body) {
    var keys;
    items.forEach(item => {
      if (!keys) keys = Object.keys(item);
      keys.forEach(key => {
        if (item[key] == null) delete item[key];
      });
      if (item.fechaIngreso) item.fechaIngreso = moment(item.fechaIngreso).format("YYYY-MM-DD");
    });


    return items;
  }

}

module.exports = ApiOperation;
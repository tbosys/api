const Errors = require("../errors");
var BaseOperation = require("../operation/baseOperation");
var Security = require("../apiHelpers/security");

class ApiOperation extends BaseOperation {
  get table() {
    return "boleta";
  }

  get multiTenantObject() {
    return true;
  }

  async postQuery(items, body) {
    var keys;
    var canSeeCosto = Security.checkQueryField(this.table, this.user, "movimientoInventario.costo");

    items.forEach(item => {
      if (!keys) keys = Object.keys(item);
      keys.forEach(key => {
        if (item[key] == null) delete item[key];
      });
      if (item.movimientoInventario) {
        try {
          item.movimientoInventario = JSON.parse(item.movimientoInventario);
        } catch (e) {}

        //if (!canSeeCosto && item.tipo == "CO") item.movimientoInventario = [];
      }
    });
    return items;
  }
}

module.exports = ApiOperation;

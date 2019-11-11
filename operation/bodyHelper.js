const Errors = require("../errors");

module.exports = class BodyHelper {

  //transforms the old-new format to the update format
  static bodyToUpdate(body, single = true) {
    var keys = Object.keys(body);
    if (keys.length == 0) throw new Errors.INTEGRATION_ERROR("El body viene vacio");
    if (!body.id) throw new Errors.INTEGRATION_ERROR("No viene el ID del Cliente");

    var newValues = {};
    var oldValues = {};
    var realKeys = [];
    keys.forEach(function (key) {
      if (key == "id") return;

      var normalizedKey = key.replace("_", "");
      if (key[0] == "_") oldValues[normalizedKey] = body[key];
      else newValues[key] = body[key];
      realKeys.push(normalizedKey);
    })

    if (Object.keys(newValues).length != Object.keys(oldValues).length) throw new Errors.UPDATE_FIELD_CONFLICT("Los keys nuevos y viejos no calzan");

    if (single) return { id: body.id, field: realKeys[0], newValue: newValues[realKeys[0]], oldValue: oldValues[realKeys[0]] }
  }

  //injects standard fields on create
  static toMultiTenantBody(body, user) {

    body.createdBy = user.name;
    body.ownerId = user.id;
    body.ownerName = user.name;
    return body;
  }

  //injects standard fields on create
  static toMultiTenantBodyUpdate(body, user) {

    body.updatedBy = user.name;
    return body;
  }


  static toClientBody(body) {
    if (Array.isArray(body)) {
      body.forEach(function (item) {
        clear(item);
      })
    }

    return body;
  }

  //get the custom, or standard action according to params.
  static getActionFor(table, fieldOrAction, fallback) {
    var Action;
    try {
      Action = typeof fieldOrAction == "string" ? require(`../actions/${table}/${fieldOrAction}`) : fieldOrAction;
    } catch (e) {
      if (!e.code || e.code != "MODULE_NOT_FOUND") console.log(e);
      Action = typeof fallback == "string" ? require(`./base${fallback}Action`) : fallback;
    }
    Action.table = table;
    return Action;
  }

  static getActionPath() {

  }

}
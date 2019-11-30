const _Errors = require("../errors");
var Ajv = require("ajv");
var localize = require("ajv-i18n");
var Errors = require("../errors");
// options can be passed, e.g. {allErrors: true}
var moment = require("moment-timezone");
var Security = require("../apiHelpers/security");

class Action {
  constructor(user, knex, context) {
    this.user = user;
    this.knex = knex;
    this.context = context;
    if (!this.context) throw new Errors.INTEGRATION_ERROR("ACTION_NO_CONTEXT");
  }

  get Errors() {
    return _Errors;
  }

  set Errors(a) {
    return;
  }

  async saveAudit(id, action, values = {}) {
    if (action == "create") values = { id: values.id };
    if (id == "") id = null;

    var audit = {
      ownerId: this.context.user.id,
      ownerName: this.context.user.name,
      type: this.table,
      action: action,
      typeid: this.table + "/" + id,
      createdAt: moment().toISOString(),
      delta: JSON.stringify(values)
    };
    if (!this.context.audit) this.context.audit = [];
    this.context.audit.push(audit);
    return true;
  }

  getOperation(table) {
    var Operation = this.context.getOperation(table);
    return new Operation(this.context, this.user, this.knex);
  }

  validate(schemaName, body, requireFields) {
    var fields = Object.keys(body);
    var item = {};
    fields.forEach(key => {
      if (body[key] != null) item[key] = body[key];
    });

    var ajv = new Ajv({ allErrors: true });
    try {
      var schema = this.context.schemaMap[schemaName];
      if (requireFields == false) delete schema.required;
      if (
        typeof requireFields == "string" &&
        schema.required.indexOf(requireFields) > -1
      )
        schema.required = [requireFields];
    } catch (e) {
      return;
    }
    var validate = ajv.compile(schema);
    var valid = validate(item);
    if (!valid) {
      //localize.es(Ajv.errors);
      throw new Errors.VALIDATION_WITH_FIELDS_ERROR(
        `${schema.title || schema.key} ${ajv.errorsText(validate.errors, {
          separator: "\n"
        })}`,
        validate.errors,
        body
      );
    }
  }

  execute() {
    return Promise.resolve({});
  }

  query(name) {
    if (Action.Query) {
      return Action.Query(name);
    }
    return this.knex;
  }

  getActionInstanceFor(table, fieldOrAction, fallback, securityChecked) {
    var Action;

    if (fallback == true) {
      fallback = null;
      securityChecked = true;
    } else if (fallback == false) {
      fallback = null;
      securityChecked = false;
    } else if (fallback == null) securityChecked = true;

    try {
      Action =
        typeof fieldOrAction == "string"
          ? requireAction(table, fieldOrAction)
          : fieldOrAction;
    } catch (e) {
      if (!e.code || e.code != "MODULE_NOT_FOUND") console.log(e);
      if (!fallback)
        fallback = fieldOrAction.replace(/^\w/, c => c.toUpperCase());
      Action =
        typeof fallback == "string"
          ? require(`./base${fallback}Action`)
          : fallback;
    }
    Action.table = table;
    var actionInstance = new Action(this.user, this.knex, this.context);
    actionInstance.table = table;
    actionInstance.securityChecked = securityChecked || false;
    return actionInstance;
  }

  getActionAndInvoke(table, fieldOrAction, body, securityChecked) {
    if (Action.GetActionAndInvoke)
      return Action.GetActionAndInvoke(table, fieldOrAction, body); //For tests
    var action = this.getActionInstanceFor(
      table,
      fieldOrAction,
      securityChecked
    );
    if (!action.securityChecked)
      Security.checkAction(
        this.table,
        this.user,
        { secure: true },
        fieldOrAction,
        action
      );

    return action.execute(table, body);
  }

  createRegistro(
    metadataId,
    field,
    departamento,
    monto,
    metadata,
    categoria,
    tipoPlazo
  ) {
    if (Action.CreateRegistro)
      return Action.CreateRegistro(
        metadataId,
        field,
        departamento,
        monto,
        metadata,
        categoria,
        tipoPlazo
      );

    var registro = {
      metadataId: metadataId,
      metadataType: this.getMetadata().key,
      field: field,
      categoria: categoria,
      tipoPlazo: tipoPlazo,
      departamento: departamento,
      metadata: JSON.stringify(metadata),
      monto: monto,
      createdBy: this.user.name,
      createdAt: moment().format("YYYY-MM-DD"),
      fecha: moment().format("YYYY-MM-DD"),
      namespaceId: process.env.NODE_ENV
    };
    if (!registro.metadataType)
      throw new Error("Registro no puede obtener tipo, revise el JSON Schema");
    return this.knex.table("registro").insert(registro);
  }

  getMetadata(table) {
    if (!table) table = Action.table || this.table; //dirParts[dirParts.length - 1];
    try {
      this._metadata = this.context.schemaMap[table];
      return this._metadata;
    } catch (e) {
      console.log(e);
      throw new Errors.ITEM_NOT_FOUND(table, "metadata");
    }
  }

  enforceSingleId(body) {
    if (!body.ids || body.ids.length == 0)
      throw new Errors.INVALID_ERROR("ENFORCE_SINGLE_ROW");
    var id = body.ids[0];
    return id;
  }

  async enforceNotStatus(body, expectedEstado) {
    var metadata = this.getMetadata();
    if (!metadata.properties[metadata.statusField]) return Promise.resolve({});
    var knexPromise = this.knex.table(this.table).select(metadata.statusField);
    if (body.ids) knexPromise = knexPromise.whereIn("id", body.ids);
    else knexPromise = knexPromise.where("id", body.ids);

    if (Array.isArray(expectedEstado))
      knexPromise = knexPromise.whereIn(metadata.statusField, expectedEstado);
    else knexPromise = knexPromise.where(metadata.statusField, expectedEstado);

    var results = await knexPromise;
    if (results.length > 0)
      throw new Errors.INVALID_ERROR("CANT_DELETE_IN_STATE");
  }

  async enforceStatus(body, expectedEstado) {
    var metadata = this.getMetadata();
    if (Action.IgnoreEnforceStatus) return;

    var knexPromise = this.knex.table(this.table).select(metadata.statusField);
    if (body.ids) knexPromise = knexPromise.whereIn("id", body.ids);
    else knexPromise = knexPromise.where("id", body.ids);

    if (Array.isArray(expectedEstado))
      knexPromise = knexPromise.whereIn(metadata.statusField, expectedEstado);
    else knexPromise = knexPromise.where(metadata.statusField, expectedEstado);

    var results = await knexPromise;
    if (results.length == 0 || results.length != body.ids.length)
      throw new Errors.INVALID_ERROR("WRONG_STATUS", [expectedEstado]);

    return results;
  }
}

module.exports = Action;

//Dependency Injection for Unit Tests
Action.GetActionAndInvoke = null;
Action.CreateRegistro = null;
Action.Query = null;
Action.IgnoreEnforceStatus = null;

Action.MockFunction = function(result) {
  var promise = Promise.resolve(result);

  function extend(promise) {
    function addMethod(promise, name) {
      promise[name] = function() {
        return extend(promise);
      };
    }
    [
      "raw",
      "table",
      "select",
      "order",
      "innerJoin",
      "leftJoin",
      "where",
      "first",
      "forUpdate",
      "rightJoin"
    ].forEach(name => {
      addMethod(promise, name);
    });
    return promise;
  }

  return extend(promise);
};

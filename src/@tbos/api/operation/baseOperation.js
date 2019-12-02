const Errors = require("../errors");
var moment = require("moment");
var BaseQuery = require("./baseQuery");
var Security = require("../apiHelpers/security");

class ApiOperation {
  constructor(context, user, knex) {
    this.context = context;
    this._user = user;
    this._knex = knex;
  }

  get table() {
    return "";
  }

  set table(a) {}

  get schema() {
    return null;
  }

  set schema(a) {}

  get secure() {
    return true;
  }

  set secure(ignore) {}

  destroy(body) {
    return this._destroy(body);
  }

  async _destroy(body) {
    if (body.ids[0] == null) throw new Errors.INVALID_ERROR("No rows selected");
    var _knex = this.knex;

    var trx = await this.knex.transaction();
    try {
      this.knex = trx;

      var current = await this.one({ id: body.ids[0] });
      var metadata = this.getMetadata();
      var Action = this.getActionFor(this.table, "destroy", "Destroy");
      var action = new Action(this.user, trx, this.context);
      action.operation = this;
      action.table = this.table;
      var resultBody = await action.execute(
        this.table,
        body,
        current,
        metadata
      );
      await trx.commit();
      this.knex = _knex;

      return resultBody;
    } catch (e) {
      await trx.rollback();
      this.knex = _knex;

      throw e;
    }
  }

  preUpdateHook(payload) {
    return payload;
  }

  async _update(body) {
    var _knex = this.knex;

    if (!body.id) throw new Errors.VALIDATION_ERROR(["id"]);

    var trx = await this.knex.transaction();
    try {
      this.knex = trx;

      var Action = this.getActionFor(this.table, "update", "Update");
      var action = new Action(this.user, trx, this.context);
      action.table = this.table;
      action.operation = this;
      body = this.preUpdateHook(body);
      var resultBody = await action.execute(this.table, body);
      await trx.commit();
      this.knex = _knex;
      return this.getOne({ filters: [["id", "=", resultBody.id]] });
    } catch (e) {
      await trx.rollback();
      this.knex = _knex;
      throw e;
    }
  }

  update(body) {
    if (Object.keys(body).length == 1) return Promise.resolve({});
    return this._update(body);
  }

  async _create(body) {
    var _knex = this.knex;
    var trx = await this.knex.transaction();
    try {
      var Action = this.getActionFor(this.table, "create", "Create");
      this.knex = trx;
      var action = new Action(this.user, trx, this.context);
      action.operation = this;
      action.table = this.table;
      var resultBody = await action.execute(this.table, body);
      await trx.commit();
      this.knex = _knex;
      return this.getOne({ filters: [["id", "=", resultBody.id]] });
    } catch (e) {
      console.log(e);
      await trx.rollback();
      this.knex = _knex;
      throw e;
    }
  }

  create(body) {
    return this._create(body);
  }

  getExternalMetadata(key) {
    try {
      var metadata = this.context.schemaMap[key];
      return metadata;
    } catch (e) {
      console.log(e);
      throw new Errors.ITEM_NOT_FOUND(this.table, "metadata");
    }
  }

  getMetadata() {
    if (this._metadata) return this._metadata;
    try {
      this._metadata = this.context.schemaMap[this.schema || this.table];
      return this._metadata;
    } catch (e) {
      console.log(e);
      throw new Errors.ITEM_NOT_FOUND(this.table, "metadata");
    }
  }

  async one(body) {
    var results = await this.query({
      fromOne: true,
      filter: { [`${this.table}.id`]: body.id },
      fields: body.fields
    });
    if (body.activo == false) return body;
    else if (!results || !results[0] || !results[0].id)
      throw new Errors.ITEM_NOT_FOUND(this.table, body.id);
    return results[0];
  }

  allWithName(body) {
    return this.query({ fields: ["id", "name"] }, true);
  }

  findLikeName(body) {
    var metadata = this.getMetadata();
    var filters = [[`${metadata.key}.name`, "like", `%${body.name}%`]];
    var keys = Object.keys(body);
    keys.forEach(key => {
      if (key != "name") filters.push([key, "=", body[key]]);
    });
    return this.query({ filters: filters, limit: 10 }, true);
  }

  async get(body) {
    var Query = new BaseQuery(this.context, this.user, this.knex, this.table);
    return Query.query(body);
  }

  async getOne(body) {
    var Query = new BaseQuery(this.context, this.user, this.knex, this.table);
    var queryResult = await Query.query(body);
    return queryResult.edges[0];
  }

  executeAction(actionName, Action) {
    var _knex = this.knex;
    return async body => {
      var trx = await this.knex.transaction();

      try {
        this.knex = trx;
        var action = new Action(this.user, this.knex, this.context);
        action.operation = this;
        action.table = this.table;
        Security.checkAction(this.table, this.user, Action, actionName, action);

        var resultBody = await action.execute(this.table, body);
        await trx.commit();
        this.knex = _knex;
        return resultBody;
      } catch (e) {
        console.log(e);
        await trx.rollback();
        this.knex = _knex;
        throw e;
      }
    };
  }

  getActionFor(table, actionNameOrAction, fallback) {
    var Action;

    try {
      if (typeof actionNameOrAction != "string") {
        Action = actionNameOrAction;
      } else {
        var exists = actionExists(table, actionNameOrAction);
        if (exists) Action = requireAction(table, actionNameOrAction);
        else if (typeof fallback != "string") return fallback;
        else if (
          [
            "Action",
            "Create",
            "Destroy",
            "Query",
            "Update",
            "BulkUpdate"
          ].indexOf(fallback) > -1
        )
          Action = require(`./base${fallback}Action`);
      }
      Action.table = table;
      Action.operation = this;
      return Action;
    } catch (e) {
      console.log(e, e.stack);
      throw new Errors.SERVER_ERROR(e.message, "Error loading module");
    }
  }

  getActionInstance(table, Action) {
    var action = new Action(this.user, this.knex, this.context);
    action.operation = this;
    action.table = table;
    return action;
  }

  getActionAndInvoke(table, actionName, body, checkSecurity) {
    var Action = this.getActionFor(table, actionName);
    var action = this.getActionInstance(table, Action);
    if (checkSecurity)
      Security.checkAction(
        table,
        this.user,
        { secure: true },
        actionName.name ? actionName.name : actionName,
        action
      );

    return action.execute(table, body);
  }

  async saveAudit(id, action, values = {}) {
    if (id == "") id = null;
    if (!this.context.audit) this.context.audit = [];
    this.context.audit.push({
      account: this.context.account,
      ownerId: this.context.user.id,
      ownerName: this.context.user.name,
      type: this.table,
      typeid: this.table + "/" + id,
      action: action,
      createdAt: moment().toISOString(),
      delta: JSON.stringify(values)
    });
    return true;
  }

  get user() {
    return this._user;
  }

  set user(userData) {
    return;
  }

  get knex() {
    return this._knex;
  }

  set knex(ignore) {
    return;
  }
}

module.exports = ApiOperation;

var BaseOperation = rootRequire("@tbos/api/operation/baseOperation");

class ApiOperation extends BaseOperation {
  constructor(context, user, knex) {
    super(context, user, knex);
    this._user = user;
    this.context = context;
    this._knex = knex;
  }
  get table() {
    return "list";
  }

  get secure() {
    return false;
  }

  async get(body) {
    return this.context.schemaMap[body.name];
  }
}

module.exports = ApiOperation;

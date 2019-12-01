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

  async columns(body) {
    const r = await this.context.knex.raw("describe " + body.table);
    return r[0];
  }

  async tables(body) {
    let r = await this.context.knex.raw("show tables");
    const tables = r[0].map(t => {
      const props = Object.getOwnPropertyNames(t);
      return t[props[0]];
    });
    return tables.filter(
      table =>
        [
          "knex_migrations",
          "knex_migrations_lock",
          "tableView",
          "profileOwner",
          "rol",
          "profile",
          "report",
          "code",
          "config"
        ].indexOf(table) == -1
    );
  }
}

module.exports = ApiOperation;

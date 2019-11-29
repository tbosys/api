var BaseOperation = rootRequire("@tbos/api/operation/baseOperation");
var BaseSchema = require("./base.json");
var fs = require("fs");
var path = require("path");

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

  async menu() {
    return Object.keys(this.context.schemaMap)
      .map(schemaKey => {
        var schema = this.context.schemaMap[schemaKey];
        return {
          title: schema.title,
          description: schema.description,
          menu: schema.menu == null ? true : schema.menu,
          key: schemaKey
        };
      })
      .filter(schema => schema.menu);
  }

  async get(body) {
    const systemSchemas = [
      "profile",
      "owner",
      "list",
      "code",
      "profileOwner",
      "rol",
      "table"
    ];

    var schema;

    if (systemSchemas.indexOf(body.name) == -1)
      schema = require(path.resolve("src", "schemas", body.name));
    else schema = rootRequire("@tbos/api/schemas/" + body.name);
    schema.properties = this.extendProperties(schema.properties);
    return {
      ...schema,
      shareLevel: schema.shareLevel || 1
    };
  }

  extendProperties(properties) {
    return Object.keys(properties)
      .map(propertyKey => {
        var property = properties[propertyKey];
        return {
          render: "string",
          filter: "string",
          sort: true,
          key: propertyKey,
          ...(BaseSchema.properties[propertyKey] ||
            BaseSchema.properties[property.extends || "___"] ||
            {}),
          ...property
        };
      })
      .reduce((obj, item) => {
        return {
          ...obj,
          [item["key"]]: item
        };
      }, {});
  }
}

module.exports = ApiOperation;

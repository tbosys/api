var JWT = require("../apiHelpers/jwt");
var errors = require("../errors");
var moment = require("moment");

module.exports = opts => {
  const defaults = {};

  const options = Object.assign({}, defaults, opts);

  return {
    before: (handler, next) => {
      let { context } = handler;

      const Schema = new SchemaModel(handler.context);
      return Schema.load(handler.context.headers)
        .then(schemaMap => {
          context.schemaMap = schemaMap;
          handler.context = context;
          return;
        })
        .catch(e => {
          throw new errors.SERVER_ERROR(e.label || e.message, 5);
        });
    },
    after: null,
    onError: null
  };
};

class SchemaModel {
  constructor(context) {
    this.context = context;
    this.check = this.load(this);
  }

  async load() {
    var tables = await this.context.knex.table("table").select();
    var schemaMap = {};
    tables.forEach(table => {
      var schemaPropertiesArray = JSON.parse(table.properties); //array

      var schemaProperties = {};

      schemaPropertiesArray.forEach(property => {
        schemaProperties[property.name] = {
          ...property,
          name: property.name,
          $id: `/properties/${property.name}`,
          type: property.type,
          key: property.name,
          title: property.title
        };
        if (property.default)
          schemaProperties[property.name].default = property.default;
      });

      var tableList = Object.keys(schemaProperties).filter(prop => {
        if (prop.isJSON) return false;
        return true;
      });
      var formList = [];
      try {
        if (table.table && table.table.length > 0)
          tableList = table.table.split(",");
      } catch (e) {
        tableList = [];
      }
      try {
        formList = JSON.parse(table.form);
        if (!table.form || formList.length == 0)
          formList = [
            {
              title: "General",
              widths: [12, 6, 3],
              columns: Object.keys(schemaProperties).filter(
                prop =>
                  [
                    "createdAt",
                    "updatedAt",
                    "createdBy",
                    "updatedBy",
                    "id"
                  ].indexOf(prop.key) == -1
              )
            }
          ];
      } catch (e) {
        tableList = Object.keys(schemaProperties).map(prop => prop.key);
      }

      var jsonSchema = {
        $id: "http://example.com/example.json",
        type: "object",
        api: "crm",
        title: table.title,
        key: table.name,
        secure: true,
        restricted: table.restricted ? table.restricted.split(",") : [],
        required: table.required ? table.required.split(",") : [],
        properties: schemaProperties,
        table: tableList,
        form: formList
      };
      schemaMap[table.name] = jsonSchema;
    });
    return Promise.resolve(schemaMap);
  }
}

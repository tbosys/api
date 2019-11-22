var BaseAction = rootRequire("@tbos/api/operation/baseCreateAction");
var moment = require("moment");
var fs = require("fs");
var path = require("path");

module.exports = class DefaultCreateAction extends BaseAction {
  async preInsert() {
    if (this.body.properties) {
      var properties = JSON.parse(this.body.properties).map(item => {
        item.id = parseInt(Math.random() * 100000);
        return item;
      });
      this.body.properties = JSON.stringify(properties);
    }
  }

  async postInsert() {
    var properties = JSON.parse(this.body.properties);
    var migration = gen(this.body.name, properties);
    var value = moment().unix();
    fs.writeFileSync(
      path.resolve("migrations", `${value}_create_${this.body.name}.js`),
      migration
    );
    return true;
  }
};

function gen(name, fields) {
  if (name == "knex_migrations" || name == "knex_migrations_lock") return;
  return `
'use strict'

exports.up = function (knex, Promise) {
  return knex.schema.createTable('${name}', function (table) {
    
    table.increments();
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.string("createdById");
    table.string("updatedById");
    table.string("ownerId");
    //auto fields
    ${fields
      .map(f => {
        // types[f.Type + "_" + f.Default + "_" + f.Extra] = f;
        return createFieldMigration(f, name);
      })
      .filter(item => item != null)
      .join(" \n ")}

  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('${name}')
};
`;
}

function createFieldMigration(field) {
  var response;

  if (field.type.indexOf("string") > -1) {
    response = `table.string('${field.name}', ${field.lenght}})`;
  } else if (field.type.indexOf("integer") > -1) {
    response = `table.integer('${field.name}', ${field.lenght})`;
    if (field.default) response += `.defaultTo(${field.default})`;
  }
  return response;
}

function createJson(table, properties) {
  var schemaProperties = {};
  properties.forEach(property => {
    schemaProperties[property.name] = {
      $id: `/properties/${property.name}`,
      type: property.type,
      title: property.title
    };
    if (property.default)
      schemaProperties[property.name].default = property.default;
  });

  return {
    $id: "http://example.com/example.json",
    type: "object",
    title: table.title,
    key: table.name,
    secure: true,
    restricted: [],
    properties: schemaProperties,
    table: [],
    form: []
  };
}

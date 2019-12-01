var BaseAction = rootRequire("@tbos/api/operation/baseUpdateAction");
var moment = require("moment");
var fs = require("fs");
var path = require("path");

module.exports = class DefaultCreateAction extends BaseAction {
  async preUpdate() {
    if (this.body.properties) {
      var properties = JSON.parse(this.body.properties).map(item => {
        item.id = parseInt(Math.random() * 100000);
        return item;
      });
      this.body.properties = JSON.stringify(properties);
    }
  }

  async postUpdate() {
    var properties = JSON.parse(this.body.properties);
    var oldProperties = JSON.parse(this.current.properties);
    var oldPropertiesMap = {};
    oldProperties.forEach(property => {
      oldPropertiesMap[property.name] = property;
    });

    var value = moment().unix();

    var newFields = [];
    var updateFields = [];
    properties.forEach(property => {
      var oldProperty = oldPropertiesMap[property.name];
      if (!oldPropertiesMap[property.name]) newFields.push(property);
      else if (oldProperty.length != property.length) newFields.push(property);
      else if (oldProperty.precision != property.precision)
        newFields.push(property);
    });

    if (newFields.length > 0) {
      var migrationCreate = gen(this.current.name, newFields);
      fs.writeFileSync(
        path.resolve(
          "migrations",
          `${value}_update_create_${this.current.name}.js`
        ),
        migrationCreate
      );
    }

    if (updateFields.length > 0) {
      var migrationUpdate = gen(this.body.name, updateFields);
      fs.writeFileSync(
        path.resolve(
          "migrations",
          `${value}_update_delta_${this.body.name}.js`
        ),
        migrationUpdate
      );
    }

    return true;
  }
};

function gen(name, fields) {
  if (name == "knex_migrations" || name == "knex_migrations_lock") return;
  return `
'use strict'

exports.up = function (knex, Promise) {
  return knex.schema.alterTable('${name}', function (table) {
    
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
  return knex.schema.alterTable('${name}', function (table) {
    ${fields.map(f => {
      return `table.dropColumn(${f.name})`;
    })})}
};
`;
}

function createFieldMigration(field) {
  var response;

  if (field.type.indexOf("string") > -1) {
    response = `table.string('${field.name}', ${field.length})`;
  } else if (field.type.indexOf("integer") > -1) {
    response = `table.integer('${field.name}', ${field.length})`;
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

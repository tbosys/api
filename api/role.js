const Errors = require("../errors");

var BaseOperation = require("../operation/baseOperation");
var Parser = require("../apiHelpers/xmlParser");
var BodyHelper = require("../operation/bodyHelper");
const AWS = require("aws-sdk");
var Promise = require("bluebird");
var RequireAll = require("require-all");
const PATH = require("path");
const dirTree = require("directory-tree");

const s3 = new AWS.S3({
  signatureVersion: "v4"
});

class Role extends BaseOperation {
  get table() {
    return "role";
  }

  get multiTenantObject() {
    return false;
  }

  async all() {
    var schemas = require("require-all")({
      dirname: process.cwd() + "/schema"
    });

    const actions = dirTree(process.cwd() + "/actions");

    var permissions = [];
    var schemaKeys = Object.keys(schemas);
    var index = 0;

    schemaKeys.forEach(key => {
      permissions.push({ id: index, name: `${key}_create` });
      index++;
      permissions.push({ id: index, name: `${key}_update` });
      index++;
      permissions.push({ id: index, name: `${key}_destroy` });
      index++;
      permissions.push({ id: index, name: `${key}_aprobar` });
      index++;
      permissions.push({ id: index, name: `${key}_query` });
      index++;
      permissions.push({ id: index, name: `${key}_destroy` });
      index++;
      permissions.push({ id: index, name: `${key}_query_*` });
      index++;
      permissions.push({ id: index, name: `${key}_*` });
      index++;

      var schema = schemas[key];
      if (schema.restricted)
        schema.restricted.forEach(restricted => {
          permissions.push({ id: index, name: `${key}_${restricted}` });
          index++;
        });

      if (schema.restrictedQuery)
        schema.restrictedQuery.forEach(restricted => {
          permissions.push({ id: index, name: `${key}_query_${restricted}` });
          index++;
        });
    });

    actions.children.forEach(actionTable => {
      var name = actionTable.name;
      if (!actionTable.children) return;
      actionTable.children.forEach(action => {
        permissions.push({ id: index, name: `${name}_${action.name.replace(".js", "")}` });
        index++;
      });
    });

    return permissions;
    //generate for all restricted fields
    //generate all restricted query fields
    //get all actions file sctructure
    //generate parentFolder_actionName permissions
  }
}

module.exports = Role;

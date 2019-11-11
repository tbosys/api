const Errors = require("../errors");
var request = require("superagent");
var BaseOperation = require("../operation/baseOperation");
const AWS = require("aws-sdk");
var RequireAll = require("require-all");
const PATH = require("path");
const dirTree = require("directory-tree");
var env = process.env.NODE_ENV || "development";

var schemas = require("require-all")({
  dirname: process.cwd() + "/schema"
});

const actions = dirTree(process.cwd() + "/actions");

var permissions = [];
var schemaKeys = Object.keys(schemas);
var index = 0;

schemaKeys.forEach(key => {
  permissions.push({ name: `${key}_create` });
  index++;
  permissions.push({ name: `${key}_update` });
  index++;
  permissions.push({ name: `${key}_destroy` });
  index++;
  permissions.push({ name: `${key}_aprobar` });
  index++;
  permissions.push({ name: `${key}_query` });
  index++;
  permissions.push({ name: `${key}_destroy` });
  index++;
  permissions.push({ name: `${key}_query_*` });
  index++;
  permissions.push({ name: `${key}_*` });
  index++;

  var schema = schemas[key];
  if (schema.restricted)
    schema.restricted.forEach(restricted => {
      permissions.push({ name: `${key}_${restricted}` });
      index++;
    });

  if (schema.restrictedQuery)
    schema.restrictedQuery.forEach(restricted => {
      permissions.push({ name: `${key}_query_${restricted}` });
      index++;
    });
});

actions.children.forEach(actionTable => {
  var name = actionTable.name;

  if (!actionTable.children) return;
  actionTable.children.forEach(action => {
    permissions.push({ name: `${name}_${action.name.replace(".js", "")}`, api: "crm" });
    index++;
  });
});

var $db = require("serverless-dynamodb-client").raw;
const DynamodbFactory = require("@awspilot/dynamodb");
var DynamoDB = new DynamodbFactory($db);

var promises = permissions.map(permission => {
  return DynamoDB.table(`${env}Role`)
    .return(DynamoDB.ALL_OLD)
    .insert_or_replace(permission);
});

let results = Promise.all(promises);

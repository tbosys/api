const Errors = rootRequire("@tbos/api/errors");
var request = require("superagent");
var BaseOperation = rootRequire("@tbos/api/operation/baseOperation");
var BaseAction = rootRequire("@tbos/api/operation/baseAction");

const PATH = require("path");
const dirTree = require("directory-tree");
var env = process.env.NODE_ENV || "development";

var permissions = [];
var index = 0;

module.exports = class AprobarAction extends BaseAction {
  async execute(table, body) {
    Object.keys(this.context.schemaMap).forEach(key => {
      var schema = this.context.schemaMap[key];

      permissions.push({ name: `${key}_create` });
      index++;
      permissions.push({ name: `${key}_update` });
      index++;
      permissions.push({ name: `${key}_destroy` });
      index++;
      permissions.push({ name: `${key}_query` });
      index++;
      permissions.push({ name: `${key}_query_*` });
      index++;
      permissions.push({ name: `${key}_*` });
      index++;

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
    const routes = dirTree(process.cwd() + "/src/routes");

    routes.children.forEach(routeTable => {
      var name = routeTable.name;
      if (!routeTable.children) return;
      routeTable.children.forEach(routeChildren => {
        if (
          routeChildren.name == "actions" &&
          routeChildren.type == "directory"
        )
          routeChildren.children.forEach(routeAction => {
            index++;
            permissions.push({
              name: `${routeTable.name}_${routeAction.name.replace(".js", "")}`,
              api: "crm"
            });
          });
      });
    });
    return permissions;
  }
};

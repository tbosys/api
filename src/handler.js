"use strict";

const path = require("path");
const fs = require("fs");
var moment = require("moment-timezone");
const middy = require("middy");

moment.tz.setDefault("America/Guatemala");

global.rootRequire = name => {
  const root = path.resolve(__dirname, name);
  var requiredModule = require(root);
  return requiredModule;
};

global.rootExists = name => {
  const root = path.resolve(__dirname, name);
  var exists = fs.existsSync(root);
  return exists;
};

global.requireAction = (table, action) => {
  var actionPath = path.resolve(__dirname, "routes", table, "actions", action);
  return rootRequire(actionPath);
};

global.actionExists = (table, action) => {
  var actionPath = path.resolve(
    __dirname,
    "routes",
    table,
    "actions",
    action + ".js"
  );
  return rootExists(actionPath);
};

const EventMiddleware = rootRequire("@tbos/api/middleware/event");
const ErrorMiddleware = rootRequire("@tbos/api/middleware/error");
//const DynamoMiddleware = require("./middleware/dynamo");
const ConfigMiddleware = rootRequire("@tbos/api/middleware/config");
const KnexMiddleware = rootRequire("@tbos/api/middleware/knex");
const AuthMiddleware = rootRequire("@tbos/api/middleware/auth");
const SchemaMiddleware = rootRequire("@tbos/api/middleware/schema");
const AuditMiddleware = rootRequire("@tbos/api/middleware/audit");
const ActionMiddleware = rootRequire("@tbos/api/middleware/action");
const ResponseMiddleware = rootRequire("@tbos/api/middleware/response");
const LogPost = rootRequire("@tbos/api/middleware/logPost");

let OriginalHandler = function(event, context) {
  return context.method.bind(context.operation)(event.payload, context);
};

const Handler = middy(OriginalHandler);
Handler.use(ErrorMiddleware())
  .use(LogPost())
  .use(AuditMiddleware())
  .use(ResponseMiddleware())
  .use(EventMiddleware())
  .use(KnexMiddleware())
  .use(SchemaMiddleware())
  .use(AuthMiddleware())
  .use(ConfigMiddleware())
  .use(ActionMiddleware());

module.exports = {
  api: Handler,
  originalHandler: OriginalHandler
};

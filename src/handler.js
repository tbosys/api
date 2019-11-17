"use strict";
global.rootRequire = name => require(`${__dirname}/${name}`);
global.requireSchema = name => require(`${__dirname}/schema/${name}`);

var AWS = require("aws-sdk");

var moment = require("moment-timezone");
moment.tz.setDefault("America/Guatemala");

const middy = require("middy");

const EventMiddleware = rootRequire("@tbos/api/middleware/event");
const ErrorMiddleware = rootRequire("@tbos/api/middleware/error");
//const DynamoMiddleware = require("./middleware/dynamo");
const ConfigMiddleware = rootRequire("@tbos/api/middleware/config");
const KnexMiddleware = rootRequire("@tbos/api/middleware/knex");
const AuthMiddleware = rootRequire("@tbos/api/middleware/auth");
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
  //.use(DynamoMiddleware())
  .use(KnexMiddleware())
  .use(AuthMiddleware())
  .use(ConfigMiddleware())
  .use(ActionMiddleware());

module.exports = {
  api: Handler,
  originalHandler: OriginalHandler
};

"use strict";
var AWS = require("aws-sdk");

var moment = require("moment-timezone");
moment.tz.setDefault("America/Guatemala");

const middy = require("middy");

const EventMiddleware = require("./middleware/event");
const ErrorMiddleware = require("./middleware/error");
const DynamoMiddleware = require("./middleware/dynamo");
const KnexMiddleware = require("./middleware/knex");
const AuthMiddleware = require("./middleware/auth");
const AuditMiddleware = require("./middleware/audit");
const ActionMiddleware = require("./middleware/action");
const ResponseMiddleware = require("./middleware/response");
const LogPost = require("./middleware/logPost");

let OriginalHandler = function(event, context) {
  return context.method.bind(context.operation)(event.payload, context);
};

const Handler = middy(OriginalHandler);
Handler.use(ErrorMiddleware())
  .use(LogPost())
  .use(AuditMiddleware())
  .use(ResponseMiddleware())
  .use(EventMiddleware())
  .use(DynamoMiddleware())
  .use(KnexMiddleware())
  .use(AuthMiddleware())
  .use(ActionMiddleware());

module.exports = {
  api: Handler,
  originalHandler: OriginalHandler
};

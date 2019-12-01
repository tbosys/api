var errors = require("../errors");
var BaseApiOperation = require("../operation/baseOperation");
var fs = require("fs");
var path = require("path");

module.exports = opts => {
  const defaults = {};

  const options = Object.assign({}, defaults, opts);

  return {
    before: (handler, next) => {
      var Operation = getOperation(handler.context.parts.operationName);
      if (!Operation)
        throw new Error(
          "[402] no se encontro la operacion " +
            handler.context.parts.operationName
        );
      var operation = new Operation(
        handler.context,
        handler.context.user,
        handler.context.knex
      );
      if (operation.secure && !handler.context.user)
        throw new errors.AUTH_ERROR("OPERATION_SECURED_NO_AUTH", [
          handler.context.parts.operationName
        ]);

      var method = operation[handler.context.parts.methodName];
      if (!method) {
        var action = operation.checkAction(handler.context.parts.methodName);
        if (!action)
          throw new Error(
            "[402] no se encontro el metodo " + handler.context.parts.methodName
          );
        method = operation.executeAction(
          handler.context.parts.methodName,
          action
        );
      }
      handler.context.method = method;
      handler.context.operation = operation;
      handler.context.getOperation = getOperation;
      next();
    },
    after: null,
    onError: null
  };
};

function getOperation(operationName) {
  var Operation;
  var pathPrefix = process.cwd();
  var operationPath = path.resolve(
    pathPrefix,
    "src",
    "routes",
    operationName,
    "index.js"
  );

  if (global.systemOperations.indexOf(operationName) > -1)
    operationPath = global.getRoot(
      `@tbos/api/routes/${operationName}/index.js`
    );

  var exists = fs.existsSync(operationPath);

  if (exists) Operation = require(operationPath);
  else
    Operation = class Op extends BaseApiOperation {
      constructor(context, user, knex) {
        super(context, user, knex);
        this._user = user;
        this.context = context;
        this._knex = knex;
      }
      get table() {
        return operationName;
      }
    };

  return Operation;
}

module.exports.getOperation = getOperation;

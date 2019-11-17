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
        throw new errors.AUTH_ERROR(
          `Operation ${handler.context.parts.operationName} is secure and user is not authenticated`
        );

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
      next();
    },
    after: null,
    onError: null
  };
};

function getOperation(operationName) {
  var Operation;
  var pathPrefix = process.cwd();

  var exists = fs.existsSync(
    path.resolve(pathPrefix, "src", "routes", "api", operationName + ".js")
  );

  if (exists)
    Operation = require(path.resolve(
      pathPrefix,
      "src",
      "routes",
      "api",
      operationName + ".js"
    ));
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

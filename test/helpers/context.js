var Handler = require("../../src/handler");
const getOperation = require("../../src/@tbos/api/middleware/action")
  .getOperation;
function Execute(
  event,
  operationName,
  methodName,
  user = {
    id: 1,
    roles: "*_*",
    name: "Test User",
    shareLevel: 1
  }
) {
  const knex = require("../../src/@tbos/api/apiHelpers/knex")();
  const context = {
    getOperation: getOperation,
    callbackWaitsForEmptyEventLoop: function() {},
    logGroupName: "/aws/lambda/xxxx-api",
    logStreamName: "2018/12/20/[$LATEST]834d36319095487c954105bd66fc24fd",
    functionName: "xxxxx-api",
    memoryLimitInMB: "512",
    functionVersion: "$LATEST",
    getRemainingTimeInMillis: function() {},
    invokeid: "22a73a83-03fb-11e9-9e91-11d545ae3724",
    awsRequestId: "22a73a83-03fb-11e9-9e91-11d545ae3724",
    invokedFunctionArn:
      "arn:aws:lambda:us-east-1:177120553227:function:xxxxxx-api:live",
    user: user,
    knex: knex,
    config: {}
  };

  var Operation = getOperation(operationName);

  var operation = new Operation(context, context.user, context.knex);

  var method = operation[methodName];
  if (!method) {
    var Action = operation.getActionFor(operation.table, methodName);
    if (!Action)
      throw new Error("[402] no se encontro el metodo " + methodName);
    method = operation.executeAction(
      methodName.name ? methodName.name : methodName,
      Action
    );
  }
  context.operation = operation;
  context.method = method;

  return Handler.originalHandler({ payload: event }, context)
    .then(async r => {
      await knex.destroy();
      return r;
    })
    .catch(async e => {
      await knex.destroy();
      throw e;
    });
}
module.exports = Execute;

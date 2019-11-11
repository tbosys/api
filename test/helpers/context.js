var Handler = require("../../handler");

function Execute(
  event,
  operationName,
  methodName,
  user = {
    id: 1,
    name: "Test User",
    nivel: 1,
    roles: "*_*",
    comisiona: true,
    account: process.env.ACCOUNT || "development"
  }
) {
  const sistema = { id: 2, name: "Sistema", roles: "*_*", nivel: 1, comisiona: false };
  const sales = { id: 3, name: "sales", roles: "*_*", nivel: 1, comisiona: true };
  const knex = require("../../apiHelpers/knex")(process.env.ACCOUNT || "development");
  const context = {
    callbackWaitsForEmptyEventLoop: function() {},
    logGroupName: "/aws/lambda/crm-testing-api",
    logStreamName: "2018/12/20/[$LATEST]834d36319095487c954105bd66fc24fd",
    functionName: "crm-testing-api",
    memoryLimitInMB: "512",
    functionVersion: "$LATEST",
    getRemainingTimeInMillis: function() {},
    invokeid: "22a73a83-03fb-11e9-9e91-11d545ae3724",
    awsRequestId: "22a73a83-03fb-11e9-9e91-11d545ae3724",
    invokedFunctionArn: "arn:aws:lambda:us-east-1:177120553227:function:crm-testing-api:live",
    user: user,
    users: [user, sistema, sales],
    userMap: { 1: user, 2: sistema, 3: sales },
    knex: knex,
    config: {
      codigoActividad: "abc",
      ubicacion: "1,00,01",
      name: process.env.ACCOUNT || "development",
      telefono: "00000000",
      cedula: "3101999999"
    }
  };

  var Api = require("../../api");

  var Operation = Api.getOperation(operationName);

  var operation = new Operation(context, context.user, context.knex);

  var method = operation[methodName];
  if (!method) {
    var action = operation.checkAction(methodName);
    method = operation.executeAction(methodName, action);
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

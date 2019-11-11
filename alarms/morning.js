var request = require("superagent");
var JWT = require("../apiHelpers/jwt");

var $db = require("serverless-dynamodb-client").raw;
const DynamodbFactory = require("@awspilot/dynamodb");
DynamodbFactory.config({ empty_string_replace_as: undefined });
var DynamoDB = new DynamodbFactory($db);

module.exports.morning = async (event, context) => {
  var prefix = "";
  if (process.env.NODE_ENV != "production" && process.env.NODE_ENV != "development")
    prefix = process.env.NODE_ENV + ".";

  var clientes = await DynamoDB.table(process.env.NODE_ENV + "Config").scan();

  var urls = ["task/morning"];

  var clientesCount = clientes.length - 1;
  while (clientesCount > -1) {
    var cliente = clientes[clientesCount];
    var urlCount = urls.length - 1;
    while (urlCount > -1) {
      var endpoint = urls[urlCount];
      var url;
      if (process.env.NODE_ENV == "development") url = `localhost:4000/crm/${endpoint}`;
      else url = `efactura.io/api/crm/${endpoint}`;

      await request
        .post(`${prefix}${url}`)
        .set("x-token", JWT.encode({ namespaceId: process.env.NODE_ENV }))
        .set("x-account", cliente.account)
        .send({});
      urlCount--;
    }
    clientesCount--;
  }

  return true;
};

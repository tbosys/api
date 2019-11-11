var request = require("superagent");
var JWT = require("../apiHelpers/jwt");

var $db = require("serverless-dynamodb-client").raw;
const DynamodbFactory = require("@awspilot/dynamodb");
DynamodbFactory.config({ empty_string_replace_as: undefined });
var DynamoDB = new DynamodbFactory($db);

module.exports.hour = async (event, context) => {
  var prefix = "";
  if (process.env.NODE_ENV != "production" && process.env.NODE_ENV != "development")
    prefix = process.env.NODE_ENV + ".";

  var clientes = await DynamoDB.table(process.env.NODE_ENV + "Config").scan();

  var urls = ["ping/hour"];

  var promises = [];

  clientes.forEach(cliente => {
    urls.forEach(endpoint => {
      var url;
      if (process.env.NODE_ENV == "development") url = `localhost:4000/crm/${endpoint}`;
      else url = `efactura.io/api/crm/${endpoint}`;
      promises.push(
        request
          .post(`${prefix}${url}`)
          .set("x-token", JWT.encode({ namespaceId: process.env.NODE_ENV }))
          .set("x-account", cliente.account)
          .send({})
      );
    });
  });

  await Promise.all(promises);
  return true;
};

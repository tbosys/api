var exec = require("child-process-promise").exec;
const AWS = require("aws-sdk");
var ses = new AWS.SES();

async function run() {
  var $db = require("serverless-dynamodb-client").raw;
  const DynamodbFactory = require("@awspilot/dynamodb");
  DynamodbFactory.config({ empty_string_replace_as: undefined });
  var DynamoDB = new DynamodbFactory($db);

  var promise;

  if (process.env.NODE_ENV) promise = DynamoDB.table(process.env.NODE_ENV + "Config").scan();
  else {
    process.env.NODE_ENV = "development";
    promise = Promise.resolve([{ account: "development" }]);
  }

  promise
    .then(async results => {
      var index = results.length - 1;
      while (index > -1) {
        var result = await exec(
          `NODE_ENV=${process.env.NODE_ENV} ACCOUNT=${
            results[index].account
          } knex migrate:latest && NODE_ENV=${process.env.NODE_ENV} ACCOUNT=${
            results[index].account
          } knex seed:run `
        );
        var stdout = result.stdout;
        var stderr = result.stderr;
        console.log("****** START MIGRATION: ", results[index].account);
        console.log("stdout: ", stdout);
        console.log("stderr: ", stderr);
        console.log("END MIGRATION ****** ");
        index--;
      }
      return true;
    })
    .catch(e => {
      console.log(e);
    });
}

(async () => {
  return run();
})();

var js2xmlparser = require("js2xmlparser");
var AWS = require("aws-sdk");
var lambda = new AWS.Lambda({
  region: "us-east-1"
});
var moment = require("moment-timezone");
var Promise = require("bluebird");
var childProcess = require("child_process");

AWS.config.apiVersions = {
  stepfunctions: "2016-11-23"
};

var stepfunctions = new AWS.StepFunctions();

module.exports = function(event) {
  if (process.env.NODE_ENV != "production" && event.firma) {
    event.firma.username = event.firma.username_staging;
    event.firma.password = event.firma.password_staging;
    event.firma.pin = event.firma.pin_staging;
    event.firma.certificado = event.firma.certificado_staging;
  }
  if (process.env.NODE_ENV == "development" || process.env.NODE_ENV == "test" || process.env.TESTING)
    return localInvoke(payload);
  var payload = JSON.stringify(event);

  var params = {
    FunctionName: "hacienda-firmar-" + process.env.NODE_ENV + "-step",
    Payload: payload
  };

  var params = {
    stateMachineArn: `arn:aws:states:us-east-1:177120553227:stateMachine:efactura-${process.env.NODE_ENV}`,
    input: payload,
    name: event.documentoClave + "-" + Math.random() * 1000
  };

  return stepfunctions.startExecution(params).promise();
};

function localInvoke(payload) {
  return Promise.resolve({});
  var command = "NODE_ENV=development sls invoke local --function=step --data='" + payload + "'";

  var promise = function(resolve, reject) {
    setTimeout(() => {
      var process = childProcess.exec(command, { cwd: "../step-efactura-firmar" }, function(err, res1, res1) {
        if (err) reject(err);
        else resolve(res1);
      });
    }, 1000);
  };
  return new Promise(promise);
}

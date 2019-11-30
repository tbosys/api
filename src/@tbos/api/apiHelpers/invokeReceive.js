var AWS = require("aws-sdk");
var lambda = new AWS.Lambda({
  region: "us-east-1"
});

AWS.config.apiVersions = {
  stepfunctions: "2016-11-23"
};

var stepfunctions = new AWS.StepFunctions();

module.exports = function(path, event) {
  if (process.env.NODE_ENV == "development" || process.env.NODE_ENV == "test")
    return Promise.resolve({});

  var payload = JSON.stringify(event);

  var params = {
    stateMachineArn: "path",
    input: payload,
    name: `${event.id}-${Math.random() * 100}`
  };

  return stepfunctions.startExecution(params).promise();
};

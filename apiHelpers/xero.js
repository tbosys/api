var AWS = require("aws-sdk");

AWS.config.apiVersions = {
  stepfunctions: "2016-11-23"
};

var stepfunctions = new AWS.StepFunctions();

module.exports = function(event) {
  if (process.env.NODE_ENV == "development" || process.env.NODE_ENV == "test" || process.env.TESTING)
    return Promise.resolve({});

  var payload = JSON.stringify(event);

  var params = {
    stateMachineArn: `arn:aws:states:us-east-1:177120553227:stateMachine:xero-${process.env.NODE_ENV}`,
    input: payload,
    name: event.type + "-" + event.id + "-" + parseInt(Math.random() * 100)
  };

  return stepfunctions.startExecution(params).promise();
};

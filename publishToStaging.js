var AWS = require("AWS-SDK");
var lambda = new AWS.Lambda(
  { apiVersion: '2015-03-31', region: "us-east-1" }
);

async function publish() {
  var params = {

    FunctionName: "crm-master-api"
  };
  var result = await lambda.publishVersion(params).promise();
  console.log(result)
}

publish()
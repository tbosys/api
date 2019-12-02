process.env.NODE_ENV = process.env.NODE_ENV || "development";
var Errors = require("../src/@tbos/api/errors");
var jwt = require("../src/@tbos/api/apiHelpers/jwt");
var chai = require("chai");
chai.should();
var Execute = require("./helpers/context");

var Handler = rootRequire("handler").api;

describe("Handler", () => {
  before(() => {
    this.timeout = 10000;
    process.env.TESTING = true;
  });

  it("Validate", function(done) {
    Handler(
      {
        body: { ids: true },
        path: "ping/now",
        headers: {
          authorization: jwt.encode({
            id: 100,
            email: "dev@dev",
            timestamp: new Date()
          })
        }
      },
      context,
      (err, res) => {
        res.statusCode.should.equal(200);
        done();
      }
    );
  });
});

const context = {
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

  config: {}
};

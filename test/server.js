process.env.NODE_ENV = process.env.NODE_ENV || "development";

var chai = require("chai");
chai.should();
var Execute = require("./helpers/context");

describe("Server Operations", () => {
  before(() => {
    this.timeout = 10000;
    process.env.TESTING = true;
  });

  it("Ping", async function() {
    var response = await Execute({ ids: true }, "ping", "now");
    return response.ids.should.be.true;
  });

  it("Ping Action", async function() {
    var response = await Execute({ ids: true }, "ping", "pingAction");
    return response.should.be.true;
  });
});

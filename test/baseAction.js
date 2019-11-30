process.env.NODE_ENV = process.env.NODE_ENV || "development";

var chai = require("chai");
chai.should();
var Execute = require("./helpers/context");

var BaseAction = rootRequire("@tbos/api/operation/baseAction");
var Errors = rootRequire("@tbos/api/errors");

class AprobarAction extends BaseAction {
  async execute(table, body) {
    return false;
  }
}

describe("Base Action", () => {
  before(() => {
    this.timeout = 10000;
    process.env.TESTING = true;
  });

  it("Validate", async function() {
    var response = await Execute({ ids: true }, "ping", AprobarAction);
    return response.should.be.false;
  });
});

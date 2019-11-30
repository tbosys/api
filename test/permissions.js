process.env.NODE_ENV = process.env.NODE_ENV || "development";
var Errors = require("../src/@tbos/api/errors");
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

describe("Permissions", () => {
  before(() => {
    this.timeout = 10000;
    process.env.TESTING = true;
  });

  it("Permission Error", async function() {
    try {
      var response = await Execute({ ids: true }, "ping", AprobarAction, {
        id: 1,
        roles: "other",
        name: "Test User",
        shareLevel: 1
      });
    } catch (e) {
      return e.status.should.equal(403);
    }
  });

  it("Permission Granted Error", async function() {
    var response = await Execute({ ids: true }, "ping", AprobarAction, {
      id: 1,
      roles: "ping_*",
      name: "Test User",
      shareLevel: 1
    });
    return response.should.be.false;
  });
});

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

class ActionA extends BaseAction {
  async execute(table, body) {
    return this.getActionAndInvoke("other table", ActionB, body, body.secure);
  }
}

class ActionB extends BaseAction {
  async execute(table, body) {
    return "ActionB";
  }
}

class ErrorAction extends BaseAction {
  async execute(table, body) {
    throw new Errors.SERVER_ERROR("error");
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

  it("Invoking Actions", async function() {
    var response = await Execute({ ids: true }, "pingA", ActionA);
    return response.should.equal("ActionB");
  });

  it("Invoking Actions with Permission Check", async function() {
    try {
      var response = await Execute(
        { ids: true, secure: true },
        "pingA",
        ActionA,
        {
          id: 1,
          roles: ["pingA_ActionA"],
          name: "Test User",
          shareLevel: 1
        }
      );
    } catch (e) {
      e.type.should.equal("PERMISSION_ERROR");
      return true;
    }
  });

  it("Invoking Actions witouth Permission Check", async function() {
    var response = await Execute({ ids: true }, "pingA", ActionA, {
      id: 1,
      roles: ["pingA_ActionA"],
      name: "Test User",
      shareLevel: 1
    });
    return response.should.equal("ActionB");
  });

  it("Error", async function() {
    try {
      var response = await Execute({ ids: true }, "ping", ErrorAction);
    } catch (e) {
      return e.status.should.equal(504);
    }
  });
});

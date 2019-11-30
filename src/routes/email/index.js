var invokeLambda = require("../apiHelpers/invokeLambda");
var BaseOperation = require("../operation/baseOperation");
const Errors = require("../errors");

class Files extends BaseOperation {
  get table() {
    return "";
  }

  get multiTenantObject() {
    return false;
  }

  async sendTemplate(body) {
    if (!body.ids || body.ids.length == 0) delete body.ids;

    if (!body.template) throw new Errors.VALIDATION_ERROR(["template"]);

    await invokeLambda("emails", "baseTemplate", {
      ...body,
      user: {
        id: this.context.user.id,
        name: this.context.user.name,
        email: this.context.user.email
      },
      account: this.context.account
    });
    return true;
  }
}
module.exports = Files;

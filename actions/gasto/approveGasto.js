var BaseAction = require("../../operation/baseCreateAction");
var Errors = require("../../errors");
var InvokeReceive = require("../../apiHelpers/invokeReceive");
var moment = require("moment-timezone");
const TipoCedula = require("../../apiHelpers/hacienda/tipoCedula");
const request = require("superagent");

module.exports = class AddToGasto extends BaseAction {
  execute(table, body) {
    this.table = table;
    this.body = body;
    return this.importar(table, body);
  }

  async importar(table, body) {
    return request
      .post(`${process.env.NODE_ENV}.email.efactura.io/api/xmls/query`)
      .send({ emailId: body.emailId });

    this.getActionAndInvoke("gasto", "addGasto");
    return request
      .post(`${process.env.NODE_ENV}.email.efactura.io/api/emails/update`)
      .send({ account: this.user.account, folder: "aceptado", emailId: body.emailId });
  }
};

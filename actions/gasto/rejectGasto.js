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
    try {
      var params = {
        MessageBody: JSON.stringify({
          emailId: this.emailId,
          folder: "rechazado"
        }),
        QueueUrl: `https://sqs.us-east-1.amazonaws.com/177120553227/${process.env.NODE_ENV}-EmailUpdateQueue`
      };

      return sqs.sendMessage(params).promise();
    } catch (e) {
      return throwError("SystemError", e, "Error cargando eventos a SQS");
    }
  }
};

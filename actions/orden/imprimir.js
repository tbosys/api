var BaseAction = require("../../operation/baseAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");
var fs = require("fs");
var https = require("https");
var querystring = require("querystring");
var request = require("superagent");
var js2xmlparser = require("js2xmlparser");
var TipoCedula = require("../../apiHelpers/hacienda/tipoCedula");
var Resumen = require("../../apiHelpers/hacienda/resumen");
var InvokeSign = require("../../apiHelpers/invokeSign");
var moment = require("moment-timezone");
var numeral = require("numeral");

const exactMath = require("exact-math");

const Slack = require("../../apiHelpers/slack");

class ImprimirOrden extends BaseAction {
  execute(table, body) {
    this.table = table;
    this.body = body;
    return this.aplicar(table, body);
  }

  async aplicar(table, body) {
    var id = this.enforceSingleId(body);
    await this.enforceStatus(body, ["por imprimir", "por enrutar"]);

    let orden1 = this.query("getOrden");

    let orden = await orden1
      .table(table)
      .select([
        "orden.*",
        "cliente.tipoCedula",
        "cliente.ownerId",
        "cliente.cedula as clienteCedula",
        "cliente.name as clienteName"
      ])
      .innerJoin("cliente", "cliente.id", "orden.clienteId")
      .where("orden.id", id)
      .forUpdate()
      .first();

    let consecutivos = await this.getActionAndInvoke("consecutivo", "incrementInventario", {});

    if (!orden.ownerId) orden.ownerId = this.user.id;

    let { ordenLineas, documento } = await this.getActionAndInvoke("documento", "facturar", {
      orden,
      consecutivos
    });

    await this.getActionAndInvoke("orden", "update", {
      id: orden.id,
      estado: "por archivar",
      documentoId: documento.id,
      _forceUpdate: true
    });

    var ordenLineaPromises = ordenLineas.map(ordenLinea => {
      ordenLinea.ordenId = orden.id;
      delete ordenLinea.especial;
      return this.getActionAndInvoke("ordenLinea", "create", ordenLinea);
    });
    await Promise.all(ordenLineaPromises);

    try {
      if (this.context.config.slack && orden.fuente != "vendedor") {
        var owner = this.context.userMap[orden.ownerId + ""];
        var createdBy = this.user;

        var message = [
          {
            fallback: "",
            author_name: this.user.name,
            title: "Nuevo Pedido de " + orden.clienteName,
            title_link: documento.pdf,
            text: "",
            fields: [
              { title: "Orden", value: orden.name || "n/d", short: true },
              { title: "Total", value: numeral(documento.totalComprobante).format("0,0.00"), short: true }
            ],
            footer: `eFactura ${process.env.NODE_ENV}`
          }
        ];
        var res = await Slack.postMessageToSingleChannel(
          this.context.config.slack.bot.bot_access_token,
          owner,
          orden.name || "Orden",
          message
        );
        console.log(res);
      }
    } catch (e) {
      console.log(e);
    }

    return {
      documentoId: documento.id,
      url: `http://facturas.efactura.io/pdf/${this.context.config.cedula}_${process.env.NODE_ENV}/${
        documento.clave
      }.html`
    };
  }
}

module.exports = ImprimirOrden;

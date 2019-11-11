var BaseAction = require("../../operation/baseAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");
var InvokeReceive = require("../../apiHelpers/invokeReceive");
var TipoCedula = require("../../apiHelpers/hacienda/tipoCedula");
var moment = require("moment");

module.exports = class Reintentar extends BaseAction {
  async execute(table, body) {
    this.table = table;
    this.body = body;

    var registros = await this.knex()
      .table("registroRecibido")
      .whereIn("id", body.ids);

    var promises = registros.map(registro => {
      if (registro.tipo.indexOf("Factura") == -1 || registro.tipo.indexOf("Mensaje Hacienda") == -1)
        throw new Errors.VALIDATION_ERROR(
          "Este documento no tiene factura y mensaje hacienda. No se puede aceptar"
        );
      if (registro.validate.length > 6)
        throw new Errors.VALIDATION_ERROR("Este documento tiene errores de validación. No se puede aceptar.");

      var delta = {
        id: registro.id,
        estado: "por aceptar",
        _forceUpdate: true
      };

      if (body.respuestaXml) delta.respuestaXml = body.respuestaXml;
      if (body.respuestaHacienda) delta.respuestaHacienda = body.respuestaHacienda;

      return this.getActionAndInvoke(table, "update", delta).then(() => {
        return InvokeReceive({
          ...this.generateHaciendaApiPayload(registro),
          namespaceId: process.env.NODE_ENV,
          firma: this.context.config,
          account: this.user.account,
          id: body.ids[0]
        });
      });
    });

    return Promise.all(promises);
  }

  generateHaciendaApiPayload(registro) {
    var emisor = JSON.parse(registro.emisor);
    var receptor = JSON.parse(registro.receptor);
    var factura = JSON.parse(registro.documentoElectronicoXml);
    var key = Object.keys(factura);
    var total = factura[key].RESUMENFACTURA.TOTALCOMPROBANTE;
    var impuesto = factura[key].RESUMENFACTURA.TOTALIMPUESTO;
    return {
      payload: {
        clave: registro.clave,
        fecha: moment().format(),
        emisor: {
          tipoIdentificacion: emisor.tipo || TipoCedula(emisor.cedula),
          numeroIdentificacion: emisor.cedula
        },
        receptor: {
          tipoIdentificacion: receptor.tipo || TipoCedula(receptor.cedula),
          numeroIdentificacion: receptor.cedula
        }
      },
      xml: {
        Clave: registro.clave,
        NumeroCedulaEmisor: emisor.cedula,
        NumeroCedulaReceptor: receptor.cedula,
        FechaEmisionDoc: moment()
          .tz("America/Costa_Rica")
          .format(),
        Mensaje: "3",
        DetalleMensaje: "",
        MontoTotalImpuesto: impuesto,
        TotalFactura: total
      }
    };
  }
};

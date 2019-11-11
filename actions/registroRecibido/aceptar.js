var BaseAction = require("../../operation/baseAction");
var Errors = require("../../errors");
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
      if (!registro.completo) {
        // || !registro.aprobadoPorResponsable) {
        if (registros.length == 1) throw new Errors.VALIDATION_ERROR("El registro debe estar completo");
        // y aprobado.");
        else return Promise.resolve({});
      }

      if (!registro.tipoCambio && !registro.moneda != "CRC") {
        if (registros.length == 1) throw new Errors.VALIDATION_ERROR("El registro no tiene tipo de cambio");
        else return Promise.resolve({});
      }

      if (!registro.totalComprobante || !registro.moneda || !registro.proveedorId) {
        if (registros.length == 1)
          throw new Errors.VALIDATION_ERROR("Revise los campos total, moneda, proveedor");
        else return Promise.resolve({});
      }

      if (registro.attachments.length == 0)
        throw new Errors.VALIDATION_ERROR("El registro no tiene archivos adjuntos,");

      if (registro.validate.length > 6) {
        if (registros.length == 1)
          throw new Errors.VALIDATION_ERROR(
            "Este documento tiene errores de validación. No se puede aceptar."
          );
        else return Promise.resolve({});
      }

      var delta = {
        id: registro.id,
        estado: registro.tipo == "Factura Manual" ? "archivado" : "por aceptar",
        _forceUpdate: true
      };

      if (body.respuestaXml) delta.respuestaXml = body.respuestaXml;
      if (body.respuestaHacienda) delta.respuestaHacienda = body.respuestaHacienda;

      return this.getActionAndInvoke(table, "update", delta).then(() => {
        if (registro.tipo == "Factura Manual")
          return this.getActionAndInvoke("gasto", "createFromRegistro", registro);
        else
          return InvokeReceive({
            ...this.generateHaciendaApiPayload(registro, this.context),
            namespaceId: process.env.NODE_ENV,
            firma: this.context.config,
            account: this.user.account,
            id: registro.id
          });
      });
    });

    return Promise.all(promises);
  }

  generateHaciendaApiPayload(registro, context) {
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
        CodigoActividad: context.config.codigoActividad,
        NumeroCedulaEmisor: emisor.cedula,
        NumeroCedulaReceptor: receptor.cedula,
        FechaEmisionDoc: moment()
          .tz("America/Costa_Rica")
          .format(),
        Mensaje: "1",
        DetalleMensaje: "",
        MontoTotalImpuesto: impuesto,
        TotalFactura: total
      }
    };
  }
};

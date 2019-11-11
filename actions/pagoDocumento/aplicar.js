const Dinero = require("dinero.js");
Dinero.globalLocale = "es-CR";
Dinero.defaultPrecision = 5;

var BaseAction = require("../../operation/baseAction");
var Errors = require("../../errors");
var moment = require("moment-timezone");
var xero = require("../../apiHelpers/xero");

module.exports = class DefaultUpdateAction extends BaseAction {
  execute(table, body) {
    this.table = table;
    this.body = body;
    return this.aplicar(table, body);
  }

  async aplicar(table, body) {
    await this.enforceStatus(body, ["por aplicar"]);

    var pagos = await this.knex
      .table(table)
      .select()
      .whereIn("id", body.ids)
      .forUpdate();

    var count = 0;
    while (count < pagos.length) {
      var pago = pagos[count];
      var lineas = JSON.parse(pago.lineaPagoDocumento);
      var monto = lineas.reduce((acumulator, currentValue) => {
        return Number.dineroNumber(acumulator, currentValue.monto, "plus");
      }, 0);

      await this.knex.table("consecutivo").increment("consecutivoRecibo", 1);
      let consecutivo = await this.knex
        .table("consecutivo")
        .select()
        .first();
      pago.monto = monto;
      pago.consecutivo = consecutivo.consecutivoRecibo;
      var delta = {
        estado: "archivado",
        monto: pago.monto,
        fechaIngreso: moment().format("YYYY-MM-DD HH:MM:00"),
        lineaPagoDocumento: "[]",
        updatedAt: moment().format("YYYY-MM-DD HH:MM:00"),
        updatedBy: this.user.name,
        consecutivo: pago.consecutivo
      };
      await this.knex
        .table("pagoDocumento")
        .update(delta)
        .where("id", pago.id);

      await this.saveAudit(pago.id, "aplicar", delta);

      await this.aplicarPago(pago);
      count++;
    }
    return pagos;
  }

  async aplicarPago(pago) {
    var lineas = JSON.parse(pago.lineaPagoDocumento);

    if (lineas.length == 0)
      throw new Errors.VALIDATION_ERROR("El recibo debe tener documentos, y no los tiene.");

    if (pago.contado && pago.monto == 0) {
    } else if (pago.formaPago != "reversion" && pago.monto < 0)
      throw new Errors.VALIDATION_ERROR(
        "El total debe ser mayor o igual a cero y se hizo un pago por " + pago.monto
      );

    var documentoIds = [];
    lineas.forEach(linea => {
      documentoIds.push(linea.documentoId);
      if (linea.monto == 0) throw new Errors.VALIDATION_ERROR("El monto de la linea es cero.");
      else if (linea.monto > 0 && linea.tipoDocumento == "NC")
        throw new Errors.VALIDATION_ERROR("Las notas de credito solo pueden tener montos negativos");
      else if (linea.monto < 0 && linea.tipoDocumento == "RD-NC")
        throw new Errors.VALIDATION_ERROR(
          "Las reversiones notas de credito solo pueden tener montos positivos"
        );
      else if (linea.monto < 0 && linea.tipoDocumento == "ND")
        throw new Errors.VALIDATION_ERROR("Las notas de debito solo pueden tener montos positivos");
      else if (linea.monto > 0 && linea.tipoDocumento == "RD-ND")
        throw new Errors.VALIDATION_ERROR(
          "Las reversiones notas de debito solo pueden tener montos negativos"
        );
      else if (linea.monto < 0 && linea.tipoDocumento == "FA")
        throw new Errors.VALIDATION_ERROR("Las facturas solo pueden tener montos positivos");
      else if (linea.monto > 0 && linea.tipoDocumento == "RD-FA")
        throw new Errors.VALIDATION_ERROR("Las reversiones de factura solo pueden tener montos negativos");
    });

    var documentos = await this.knex
      .table("documento")
      .select("id", "fecha")
      .where("id", "IN", documentoIds);
    var documentoMapPlazo = {};
    documentos.forEach(documento => {
      documentoMapPlazo[documento.id] = moment().diff(documento.fecha, "days");
    });

    var count = 0;
    while (count < lineas.length) {
      var lineaPagoDocumento = lineas[count];
      lineaPagoDocumento.diasCredito = documentoMapPlazo[lineaPagoDocumento.documentoId];
      lineaPagoDocumento.pagoDocumentoId = pago.id;
      lineaPagoDocumento._consecutivo = pago.consecutivo;
      lineaPagoDocumento.fecha = pago.fecha;
      lineaPagoDocumento.ownerId = pago.ownerId;
      delete lineaPagoDocumento.recibo;
      lineas[count] = await this.getActionAndInvoke("lineaPagoDocumento", "create", lineaPagoDocumento);
      count++;
    }

    await this.getActionAndInvoke("comisionHistorico", "fromPago", {
      ownerId: pago.ownerId,
      lineaPagoDocumentos: lineas
    });

    await xero({ id: pago.id, type: "PAGO" }, this.context);

    return lineas;
  }
};

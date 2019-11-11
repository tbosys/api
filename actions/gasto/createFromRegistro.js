var BaseAction = require("../../operation/baseCreateAction");
var moment = require("moment-timezone");
const request = require("superagent");
const errors = require("../../errors");

module.exports = class AddToGasto extends BaseAction {
  async execute(table, body) {
    this.table = table;
    this.body = body;

    var factura = JSON.parse(body.documentoElectronicoXml || {});

    let gasto = {
      ...this.appendValuesToGasto(body),
      ...this.appendXmlToGasto(body, factura),
      clave: body.clave,
      attachments: body.attachments,
      referencia: body.clave,
      linkFacturaXml: body.xml,
      registroRecibidoId: body.id,
      linkFactura: body.pdf,
      linkRespuesta: body.respuestaXml,
      respuestaXML: body.mensajeXml,
      estado: "por categorizar",
      proveedorId: body.proveedorId
    };
    await this.getActionAndInvoke(table, "create", gasto);
    return this.gasto;
  }

  async appendValuesToGasto(body) {
    let gasto = {};
    gasto.tipo = "FA";
    gasto.tipoCambio = body.tipoCambio;
    gasto.moneda = body.moneda;
    gasto.fecha = moment(body.createdAt).format("YYYY-MM-DD");

    gasto.impuesto = body.impueto || 0;
    gasto.subTotal = body.total - gasto.impuesto;
    gasto.descuento = 0;
    gasto.total = body.total - gasto.impuesto;
    gasto.saldo = gasto.total;

    gasto.subTotalConDescuento = gasto.total - gasto.impuesto;
    gasto.asignacion = "";
  }

  async appendXmlToGasto(body, xml) {
    var gasto = {};
    var keys = Object.keys(xml);
    if (keys.length == 0) return {};
    var key0 = keys[0];
    var tipo = "FA";
    if (key0 == "NOTACREDITOELECTRONICA") tipo = "NC";
    else if (key0 == "NOTADEBITOELECTRONICA") tipo = "ND";
    if (body.moneda == "CRC") body.tipoCambio = 1;
    else if (body.tipoCambio <= 1)
      throw new errors.VALIDATION_ERROR(
        "El tipo de cambio para una factura en " + body.moneda + " debe ser mayor a 1"
      );
    //gasto.linkFacturaXml = xml.key;
    var resumenFactura = xml[key0].RESUMENFACTURA;
    gasto.tipo = tipo;
    gasto.tipoCambio = body.tipoCambio;
    gasto.moneda = resumenFactura.CODIGOMONEDA;
    gasto.fecha = moment(xml[key0].FECHAEMISION).format("YYYY-MM-DD");
    gasto.consecutivo = xml[key0].CONSECUTIVO;
    gasto.moneda = resumenFactura.CODIGOMONEDA;
    gasto.tipoCambio = parseFloat(gasto.tipoCambio || 1);
    gasto.subTotal = parseFloat(resumenFactura.TOTALVENTA || 0) * body.tipoCambio;
    gasto.impuesto = parseFloat(resumenFactura.TOTALIMPUESTO || 0) * body.tipoCambio;
    gasto.descuento = parseFloat(resumenFactura.TOTALDESCUENTOS || 0) * body.tipoCambio;
    gasto.total = parseFloat(resumenFactura.TOTALCOMPROBANTE || 0) * body.tipoCambio;
    gasto.saldo = parseFloat(resumenFactura.TOTALCOMPROBANTE || 0) * body.tipoCambio;
    gasto.resumenFactura = JSON.stringify(resumenFactura);
    gasto.subTotalConDescuento = parseFloat(resumenFactura.TOTALVENTA || 0) * body.tipoCambio;
    gasto.asignacion = "";
    gasto.detalleServicio = JSON.stringify(xml[key0].DETALLESERVICIO);

    return gasto;
  }
};

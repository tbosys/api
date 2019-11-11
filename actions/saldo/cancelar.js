var BaseAction = require("../../operation/baseCreateAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");

var moment = require("moment-timezone");

const Dinero = require("dinero.js");
Dinero.globalLocale = "es-CR";
Dinero.defaultPrecision = 5;

module.exports = class DefaultUpdateAction extends BaseAction {
  execute(table, body) {
    this.table = table;
    this.body = body;
    return this.cancelar(table, body);
  }

  async cancelar(table, body) {
    this.enforceSingleId(body);
    body.id = body.ids[0];

    var saldo = await this.knex
      .table(table)
      .select()
      .where("id", body.id)
      .first();

    this.cliente = await this.knex
    .table("cliente")
    .select("id","ownerId", "vendedorId", "name", "cedula", "tipoCedula")
    .where("id", saldo.clienteId)
    .first();

    if (!saldo) throw new Errors.VALIDATION_ERROR(`Este saldo ya fue actualizado.`);
    if (saldo.total < 0 || saldo > 100) throw new Errors.VALIDATION_ERROR(`La cancelacion solo esta permitida para saldo con monto mayor a 0 y menor a 100.`);
    if (process.env.NODE_ENV == "production") throw new Errors.VALIDATION_ERROR(`Esta operacion no esta habilitada en production`);
    if (saldo.tipo != "FA") throw new Errors.VALIDATION_ERROR(`Solo se pueden pagar facturas de esta forma`);

    var lines = [
        {
          consecutivo: saldo.consecutivo,
          documentoId: saldo.documentoId,
          moneda: saldo.moneda,
          monto: saldo.total,
          plazoDocumento: 0,
          _saldoId: saldo.id,
          tipoCambio: saldo.tipoCambio,
          tipoDocumento: saldo.tipo
        }
    ];

    console.log(lines);

    let nc = await this.getActionAndInvoke("documento", "createNota", { nota: this.createNota("NC",this.cliente,saldo.consecutivo,saldo.total)});
    await this.getActionAndInvoke("documento", "createNota", { nota: this.createNota("ND",this.cliente,saldo.consecutivo,saldo.total)});

    var saldo = await this.knex
    .table("saldo")
    .select()
    .where("documentoId", nc.id)
    .first();
    var newLinea = {"_saldoId": saldo.id, "documentoId": nc.id, "consecutivo":nc.consecutivo, "tipoDocumento": "NC", "plazoDocumento":90, "moneda":"CRC","tipoCambio":1,"monto":saldo.total, "_saldo":saldo.total};
    lines.push(newLinea);

    var montoPago = 0;
    lines.forEach(line => montoPago + line.monto);

    var pago = {
      clienteId: saldo.clienteId,
      formaPago: 'nota credito',
      referencia: saldo.consecutivo,
      moneda: saldo.moneda,
      contado: false,
      tipoCambio: saldo.tipoCambio,
      recibo: 0,
      monto: montoPago,
      lineaPagoDocumento: lines
    };

    var action = this.getActionInstanceFor("pagoDocumento", "create");
    var result = await action.execute("pagoDocumento", pago);

    var action = this.getActionInstanceFor("pagoDocumento", "aplicar");
    result = await action.execute("pagoDocumento", { ids: [result.id] });

    return result;
  }

  createNota(tipo, cliente, consecutivo, monto){
    return {
      "tipo": tipo,
      "ownerId": cliente.ownerId,
      "clienteId": cliente.id,
      "descripcion": `Reversion saldo minimo en Factura ${consecutivo}`,
      "clienteVendedorId": cliente.vendedorId,
      "clienteName": cliente.name,
      "clienteCedula": cliente.cedula,
      "clienteTipoCedula": cliente.tipoCedula,
      "totalComprobante": monto
    }
  }

};

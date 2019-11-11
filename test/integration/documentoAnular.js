process.env.NODE_ENV = process.env.NODE_ENV || "development";

var chai = require("chai");
chai.should();
var Execute = require("../helpers/context");
var ProductoWithInventarioAndPrecio = require("../helpers/combo/productoWithInventarioAndPrecio");
var Cliente = require("../helpers/objects/cliente");
var Orden = require("../helpers/objects/orden");
var Query = require("../helpers/query");
var Nota = require("../helpers/objects/nota");

var ImprimirOrden = require("../helpers/combo/imprimirOrden");

describe("Documentos Anular", () => {
  before(() => {
    this.timeout = 10000;
    process.env.TESTING = true;
  });
  it("Anular Documento", async function() {
    var orden;

    var cliente = await Cliente({ ownerId: 2 });
    var producto = await ProductoWithInventarioAndPrecio();

    orden = await Orden({ clienteId: cliente.id }, [{ ...producto, cantidad: 1 }]);
    orden = await ImprimirOrden(orden);

    var saldo = await Query.byValue("saldo", "clienteId", cliente.id);
    saldo.total.should.equal(1.13);

    var documento = await Query.byValue("documento", "ordenId", orden.id);
    await Execute({ ids: [documento.id] }, "documento", "anular");

    var documentoCheck = await Query.byValue("documento", "ordenId", orden.id);
    documentoCheck.anulacion.should.equal(1); //Documento quedo anulado;
    //documentoCheck.documentoAnuladoDeId.should.equal(saldo.documentoId); //Documento quedo anulado;

    var saldoNC = await Query.byFiltersOne(
      [["saldo.activo", "=", false], ["saldo.clienteId", "=", cliente.id], ["saldo.tipo", "=", "NC"]],
      "saldo"
    );
    saldoNC.total.should.equal(0);
    var documentoNCCheck = await Query.byValue("documento", "id", saldoNC.documentoId);
    documentoNCCheck.anulacion.should.equal(1);

    var saldoFA = await Query.byFiltersOne(
      [["saldo.activo", "=", false], ["saldo.documentoId", "=", documentoCheck.id]],
      "saldo"
    );

    saldoFA.total.should.equal(0);
    saldoFA.ownerId.should.equal(2);
    var pago = await Query.byFiltersOne([["pagoDocumento.clienteId", "=", cliente.id]], "pagoDocumento");
    pago.monto.should.equal(0);
    pago.ownerId.should.equal(2);
    var pagoLineas = await Query.byFiltersAll([["pagoDocumentoId", "=", pago.id]], "lineaPagoDocumento");
    pagoLineas[0].documentoId.should.equal(documentoCheck.id);
    pagoLineas[0].monto.should.equal(documentoCheck.totalComprobante);
    pagoLineas[0].ownerId.should.equal(2);
    pagoLineas[1].documentoId.should.equal(documentoNCCheck.id);
    pagoLineas[1].monto.should.equal(documentoNCCheck.totalComprobante);

    var movimientos = await Query.byFiltersAll(
      [["documento.clienteId", "=", cliente.id]],
      "movimientoInventario"
    );

    movimientos.forEach(m => m.ownerId.should.equal(2));

    return true;
  });

  it("Anular Documento contado", async function() {
    var orden;

    var cliente = await Cliente({ creditoPlazo: 0, creditoLimite: 0, ownerId: 2 });
    var producto = await ProductoWithInventarioAndPrecio();

    orden = await Orden({ clienteId: cliente.id, plazo: 0 }, [{ ...producto, cantidad: 1 }]);
    orden = await ImprimirOrden(orden);
    orden.plazo.should.equal(0);

    var saldo = await Query.byValue("saldo", "clienteId", cliente.id);
    saldo.total.should.equal(1.13);

    var documento = await Query.byValue("documento", "ordenId", orden.id);
    await Execute({ ids: [documento.id] }, "documento", "anular");

    var documentoCheck = await Query.byValue("documento", "ordenId", orden.id);
    documentoCheck.anulacion.should.equal(1); //Documento quedo anulado;
    documentoCheck.plazo.should.equal(0);
    documentoCheck.tipo.should.equal("FA");
    documentoCheck.totalComprobante.should.equal(1.13);

    var saldoNC = await Query.byFiltersOne(
      [["saldo.activo", "=", false], ["saldo.clienteId", "=", cliente.id], ["saldo.tipo", "=", "NC"]],
      "saldo"
    );
    saldoNC.total.should.equal(0);
    var documentoNCCheck = await Query.byValue("documento", "id", saldoNC.documentoId);
    documentoNCCheck.anulacion.should.equal(1);
    documentoNCCheck.plazo.should.equal(0);
    documentoNCCheck.tipo.should.equal("NC");
    documentoNCCheck.totalComprobante.should.equal(-1.13);

    var saldoFA = await Query.byFiltersOne(
      [["saldo.activo", "=", false], ["saldo.documentoId", "=", documentoCheck.id]],
      "saldo"
    );

    saldoFA.total.should.equal(0);

    var pago = await Query.byFiltersOne([["pagoDocumento.clienteId", "=", cliente.id]], "pagoDocumento");
    pago.monto.should.equal(0);

    var pagoLineas = await Query.byFiltersAll([["pagoDocumentoId", "=", pago.id]], "lineaPagoDocumento");
    pagoLineas[0].documentoId.should.equal(documentoCheck.id);
    pagoLineas[0].monto.should.equal(documentoCheck.totalComprobante);

    pagoLineas[1].documentoId.should.equal(documentoNCCheck.id);
    pagoLineas[1].monto.should.equal(documentoNCCheck.totalComprobante);

    var movimientos = await Query.byFiltersAll(
      [["documento.clienteId", "=", cliente.id]],
      "movimientoInventario"
    );

    movimientos.forEach(m => m.ownerId.should.equal(2));

    return true;
  });

  it("Anular NC", async function() {
    this.timeout = 1000000;
    var orden;

    var cliente = await Cliente({ ownerId: 2 });
    await Nota("NC", { clienteId: cliente.id });

    var nota = await Query.byFiltersOne(
      [["documento.clienteId", "=", cliente.id], ["documento.tipo", "=", "NC"]],
      "documento"
    );

    var documento = await Query.byId("documento", nota.id);
    await Execute({ ids: [documento.id] }, "documento", "anular");

    var documentoNCCheck = await Query.byId("documento", nota.id);
    documentoNCCheck.anulacion.should.equal(1); //Documento quedo anulado;
    documentoNCCheck.tipo.should.equal("NC");
    documentoNCCheck.totalComprobante.should.equal(-33333);

    var saldoNC = await Query.byFiltersOne(
      [["saldo.activo", "=", false], ["saldo.clienteId", "=", cliente.id], ["saldo.tipo", "=", "NC"]],
      "saldo"
    );
    saldoNC.total.should.equal(0);

    var documentoNDCheck = await Query.byFiltersOne(
      [["documento.clienteId", "=", cliente.id], ["documento.tipo", "=", "ND"]],
      "documento"
    );
    documentoNDCheck.anulacion.should.equal(1);
    documentoNDCheck.plazo.should.equal(90);
    documentoNDCheck.tipo.should.equal("ND");
    documentoNDCheck.totalComprobante.should.equal(33333);
    documentoNDCheck.ownerId.should.equal(2);

    var saldoND = await Query.byFiltersOne(
      [["saldo.activo", "=", false], ["saldo.clienteId", "=", cliente.id], ["saldo.tipo", "=", "ND"]],
      "saldo"
    );
    saldoND.total.should.equal(0);
    saldoND.ownerId.should.equal(2);

    var pago = await Query.byFiltersOne([["pagoDocumento.clienteId", "=", cliente.id]], "pagoDocumento");
    pago.monto.should.equal(0);
    pago.ownerId.should.equal(2);

    var pagoLineas = await Query.byFiltersAll([["pagoDocumentoId", "=", pago.id]], "lineaPagoDocumento");
    pagoLineas[0].documentoId.should.equal(documentoNCCheck.id);
    pagoLineas[0].monto.should.equal(-33333);
    pagoLineas[0].ownerId.should.equal(2);

    pagoLineas[1].documentoId.should.equal(documentoNDCheck.id);
    pagoLineas[1].monto.should.equal(33333);

    return true;
  });

  it("Anular ND", async function() {
    this.timeout = 1000000;
    var orden;

    var cliente = await Cliente();
    await Nota("ND", { clienteId: cliente.id });

    var nota = await Query.byFiltersOne(
      [["documento.clienteId", "=", cliente.id], ["documento.tipo", "=", "ND"]],
      "documento"
    );

    var documento = await Query.byId("documento", nota.id);
    await Execute({ ids: [documento.id] }, "documento", "anular");

    var documentoNDCheck = await Query.byId("documento", nota.id);
    documentoNDCheck.anulacion.should.equal(1); //Documento quedo anulado;
    documentoNDCheck.tipo.should.equal("ND");
    documentoNDCheck.totalComprobante.should.equal(33333);

    var saldoND = await Query.byFiltersOne(
      [["saldo.activo", "=", false], ["saldo.clienteId", "=", cliente.id], ["saldo.tipo", "=", "ND"]],
      "saldo"
    );
    saldoND.total.should.equal(0);

    var documentoNCCheck = await Query.byFiltersOne(
      [["documento.clienteId", "=", cliente.id], ["documento.tipo", "=", "NC"]],
      "documento"
    );
    documentoNCCheck.anulacion.should.equal(1);
    documentoNCCheck.plazo.should.equal(90);
    documentoNCCheck.tipo.should.equal("NC");
    documentoNCCheck.totalComprobante.should.equal(-33333);

    var saldoNC = await Query.byFiltersOne(
      [["saldo.activo", "=", false], ["saldo.clienteId", "=", cliente.id], ["saldo.tipo", "=", "NC"]],
      "saldo"
    );
    saldoNC.total.should.equal(0);

    var pago = await Query.byFiltersOne([["pagoDocumento.clienteId", "=", cliente.id]], "pagoDocumento");
    pago.monto.should.equal(0);

    var pagoLineas = await Query.byFiltersAll([["pagoDocumentoId", "=", pago.id]], "lineaPagoDocumento");
    pagoLineas[0].documentoId.should.equal(documentoNDCheck.id);
    pagoLineas[0].monto.should.equal(33333);

    pagoLineas[1].documentoId.should.equal(documentoNCCheck.id);
    pagoLineas[1].monto.should.equal(-33333);

    return true;
  });

  it("No se puede anular documento dos veces", async function() {
    var orden;

    var cliente = await Cliente();
    var producto = await ProductoWithInventarioAndPrecio();

    orden = await Orden({ clienteId: cliente.id }, [{ ...producto, cantidad: 1 }]);
    orden = await ImprimirOrden(orden);

    var saldo = await Query.byValue("saldo", "clienteId", cliente.id);
    saldo.total.should.equal(1.13);

    var documento = await Query.byValue("documento", "ordenId", orden.id);

    await Execute({ ids: [documento.id] }, "documento", "anular");
    var catched = false;
    try {
      await Execute({ ids: [documento.id] }, "documento", "anular");
    } catch (e) {
      catched = true;
    }
    catched.should.equal(true);
    return true;
  });
});

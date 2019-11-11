process.env.NODE_ENV = process.env.NODE_ENV || "development";

var chai = require("chai");
chai.should();
var Execute = require("../helpers/context");
var ProductoWithInventarioAndPrecio = require("../helpers/combo/productoWithInventarioAndPrecio");
var Cliente = require("../helpers/objects/cliente");
var Orden = require("../helpers/objects/orden");
var Query = require("../helpers/query");
var Nota = require("../helpers/objects/nota");
var Pago = require("../helpers/objects/pago");

var ImprimirOrden = require("../helpers/combo/imprimirOrden");

describe("Pagos de credito", () => {
  it("Pago de credito simple", async function() {
    before(() => {
      this.timeout = 10000;
      process.env.TESTING = true;
    });
    var orden;

    var cliente = await Cliente({ ownerId: 2 });
    var producto = await ProductoWithInventarioAndPrecio();

    orden = await Orden({ clienteId: cliente.id }, [{ ...producto, cantidad: 1 }]);
    orden = await ImprimirOrden(orden);

    var saldo = await Query.byValue("saldo", "clienteId", cliente.id);
    saldo.total.should.equal(1.13);

    var pago = await Pago({ clienteId: cliente.id }, [{ id: saldo.documentoId, monto: saldo.total }]);
    pago.ownerId.should.equal(2);

    var saldoCheck = await Query.byFiltersOne(
      [["saldo.clienteId", "=", cliente.id], ["saldo.activo", "=", false]],
      "saldo"
    );
    saldoCheck.total.should.equal(0);
    saldoCheck.activo.should.equal(0);

    var pagoLineas = await Query.byFiltersAll([["pagoDocumentoId", "=", pago.id]], "lineaPagoDocumento");
    pagoLineas[0].documentoId.should.equal(saldo.documentoId);
    pagoLineas[0].diasCredito.should.equal(0);
    pagoLineas[0].monto.should.equal(saldo.total);
    pagoLineas[0].ownerId.should.equal(2);
    return true;
  });

  it("Facturar Orden contado con NC vieja - Pago Total", async function() {
    var orden;

    var cliente = await Cliente();
    var producto = await ProductoWithInventarioAndPrecio();

    orden = await Orden({ clienteId: cliente.id, plazo: 30 }, [{ ...producto, cantidad: 1 }]);
    orden = await ImprimirOrden(orden);

    var saldo = await Query.byValue("saldo", "clienteId", cliente.id);
    saldo.total.should.equal(1.13);
    await Nota("NC", { clienteId: cliente.id, totalComprobante: 1.13 });

    var saldoInit = await Query.byFiltersOne(
      [["saldo.clienteId", "=", cliente.id], ["saldo.tipo", "=", "FA"]],
      "saldo"
    );

    var notaInit = await Query.byFiltersOne(
      [["saldo.clienteId", "=", cliente.id], ["saldo.tipo", "=", "NC"]],
      "saldo"
    );

    var pago = await Pago({ clienteId: cliente.id }, [
      { id: saldoInit.documentoId, monto: saldoInit.totalComprobante, _saldoId: saldoInit.id },
      { id: notaInit.documentoId, monto: notaInit.totalComprobante, _saldoId: notaInit.id }
    ]);

    var saldoCheck = await Query.byFiltersOne(
      [["saldo.clienteId", "=", cliente.id], ["saldo.activo", "=", false], ["saldo.tipo", "=", "FA"]],
      "saldo"
    );
    saldoCheck.total.should.equal(0);
    saldoCheck.activo.should.equal(0);

    var saldoNCCheck = await Query.byFiltersOne(
      [["saldo.clienteId", "=", cliente.id], ["saldo.activo", "=", false], ["saldo.tipo", "=", "NC"]],
      "saldo"
    );
    saldoNCCheck.total.should.equal(0);
    saldoNCCheck.activo.should.equal(0);

    var pagoLineas = await Query.byFiltersAll([["pagoDocumentoId", "=", pago.id]], "lineaPagoDocumento");
    pagoLineas[0].documentoId.should.equal(saldo.documentoId);
    pagoLineas[0].monto.should.equal(saldo.total);

    pagoLineas[1].documentoId.should.equal(saldoNCCheck.documentoId);
    pagoLineas[1].monto.should.equal(saldo.total * -1);

    return true;
  });

  it("Facturar Orden contado con NC grande vieja - ND", async function() {
    var orden;

    var cliente = await Cliente();
    var producto = await ProductoWithInventarioAndPrecio();

    orden = await Orden({ clienteId: cliente.id, plazo: 30 }, [{ ...producto, cantidad: 1 }]);
    orden = await ImprimirOrden(orden);

    var saldo = await Query.byValue("saldo", "clienteId", cliente.id);
    saldo.total.should.equal(1.13);
    await Nota("NC", { clienteId: cliente.id, totalComprobante: 100 });
    await Nota("ND", { clienteId: cliente.id, totalComprobante: 1 });

    var saldoInit = await Query.byFiltersOne(
      [["saldo.clienteId", "=", cliente.id], ["saldo.tipo", "=", "FA"]],
      "saldo"
    );

    var notaInit = await Query.byFiltersOne(
      [["saldo.clienteId", "=", cliente.id], ["saldo.tipo", "=", "NC"]],
      "saldo"
    );

    var notaDInit = await Query.byFiltersOne(
      [["saldo.clienteId", "=", cliente.id], ["saldo.tipo", "=", "ND"]],
      "saldo"
    );

    var pago = await Pago({ clienteId: cliente.id }, [
      { id: saldoInit.documentoId, monto: 1.13, _saldoId: saldoInit.id },
      { id: notaInit.documentoId, monto: -2.13, _saldoId: notaInit.id },
      { id: notaDInit.documentoId, monto: 1, _saldoId: notaDInit.id }
    ]);

    var saldoCheck = await Query.byFiltersOne(
      [["saldo.clienteId", "=", cliente.id], ["saldo.activo", "=", false], ["saldo.tipo", "=", "FA"]],
      "saldo"
    );
    saldoCheck.total.should.equal(0);
    saldoCheck.activo.should.equal(0);

    var saldoNCCheck = await Query.byFiltersOne(
      [["saldo.clienteId", "=", cliente.id], ["saldo.activo", "=", true], ["saldo.tipo", "=", "NC"]],
      "saldo"
    );
    saldoNCCheck.total.should.equal(-97.87);
    saldoNCCheck.activo.should.equal(1);

    var saldoNDCheck = await Query.byFiltersOne(
      [["saldo.clienteId", "=", cliente.id], ["saldo.activo", "=", false], ["saldo.tipo", "=", "ND"]],
      "saldo"
    );
    saldoNDCheck.total.should.equal(0);
    saldoNDCheck.activo.should.equal(0);

    var pagoLineas = await Query.byFiltersAll([["pagoDocumentoId", "=", pago.id]], "lineaPagoDocumento");
    pagoLineas[0].documentoId.should.equal(saldo.documentoId);
    pagoLineas[0].monto.should.equal(saldo.total);

    pagoLineas[1].documentoId.should.equal(saldoNCCheck.documentoId);
    pagoLineas[1].monto.should.equal(-2.13);

    pagoLineas[2].documentoId.should.equal(saldoNDCheck.documentoId);
    pagoLineas[2].monto.should.equal(1);

    return true;
  });

  it("Facturar Orden contado con 2 NC peq vieja", async function() {
    var orden;

    var cliente = await Cliente();
    var producto = await ProductoWithInventarioAndPrecio();

    orden = await Orden({ clienteId: cliente.id, plazo: 30 }, [{ ...producto, cantidad: 1 }]);
    orden = await ImprimirOrden(orden);

    var saldo = await Query.byValue("saldo", "clienteId", cliente.id);
    saldo.total.should.equal(1.13);
    await Nota("NC", { clienteId: cliente.id, totalComprobante: 0.5 });
    await Nota("NC", { clienteId: cliente.id, totalComprobante: 0.5 });

    var saldoInit = await Query.byFiltersOne(
      [["saldo.clienteId", "=", cliente.id], ["saldo.tipo", "=", "FA"]],
      "saldo"
    );

    var notaInit = await Query.byFiltersAll(
      [["saldo.clienteId", "=", cliente.id], ["saldo.tipo", "=", "NC"]],
      "saldo"
    );

    var pago = await Pago(
      { clienteId: cliente.id },
      notaInit
        .map(nota => {
          return { id: nota.documentoId, monto: nota.totalComprobante, _saldoId: nota.id };
        })
        .concat([{ id: saldoInit.documentoId, monto: 1.13, _saldoId: saldoInit.id }])
    );

    var saldoCheck = await Query.byFiltersOne(
      [["saldo.clienteId", "=", cliente.id], ["saldo.activo", "=", false], ["saldo.tipo", "=", "FA"]],
      "saldo"
    );
    saldoCheck.total.should.equal(0);
    saldoCheck.activo.should.equal(0);

    var saldoNCChecks = await Query.byFiltersAll(
      [["saldo.clienteId", "=", cliente.id], ["saldo.activo", "=", false], ["saldo.tipo", "=", "NC"]],
      "saldo"
    );
    var saldoNCCheck = saldoNCChecks[0];
    saldoNCCheck.total.should.equal(0);
    saldoNCCheck.activo.should.equal(0);

    var saldoNCCheck2 = saldoNCChecks[1];
    saldoNCCheck2.total.should.equal(0);
    saldoNCCheck2.activo.should.equal(0);

    pago.monto.should.equal(0.13);
    var pagoLineas = await Query.byFiltersAll([["pagoDocumentoId", "=", pago.id]], "lineaPagoDocumento");
    //pagoLineas[0].documentoId.should.equal(saldo.documentoId);
    pagoLineas[0].monto.should.equal(saldo.total);

    //pagoLineas[1].documentoId.should.equal(saldoNCCheck.documentoId);
    pagoLineas[1].monto.should.equal(-0.5);

    //pagoLineas[2].documentoId.should.equal(saldoNCCheck2.documentoId);
    pagoLineas[2].monto.should.equal(-0.5);

    var saldoFin = await Query.byFiltersOne(
      [["saldo.clienteId", "=", cliente.id], ["saldo.activo", "=", false], ["saldo.tipo", "=", "FA"]],
      "saldo"
    );

    saldoFin.total.should.equal(0);

    return true;
  });

  it("Facturar Orden contado con 2 NC abono grande vieja", async function() {
    var orden;

    var cliente = await Cliente();
    var producto = await ProductoWithInventarioAndPrecio();

    orden = await Orden({ clienteId: cliente.id }, [{ ...producto, cantidad: 1 }]);
    orden = await ImprimirOrden(orden);

    var saldo = await Query.byValue("saldo", "clienteId", cliente.id);
    saldo.total.should.equal(1.13);
    await Nota("NC", { clienteId: cliente.id, totalComprobante: 0.5 });
    await Nota("NC", { clienteId: cliente.id, totalComprobante: 0.5 });

    var saldoInit = await Query.byFiltersOne(
      [["saldo.clienteId", "=", cliente.id], ["saldo.tipo", "=", "FA"]],
      "saldo"
    );

    var notaInit = await Query.byFiltersAll(
      [["saldo.clienteId", "=", cliente.id], ["saldo.tipo", "=", "NC"]],
      "saldo"
    );

    var pago = await Pago(
      { clienteId: cliente.id },
      notaInit
        .map(nota => {
          return { id: nota.documentoId, monto: nota.totalComprobante, _saldoId: nota.id };
        })
        .concat([{ id: saldoInit.documentoId, monto: 1, _saldoId: saldoInit.id }])
    );

    var saldoCheck = await Query.byFiltersOne(
      [["saldo.clienteId", "=", cliente.id], ["saldo.activo", "=", true], ["saldo.tipo", "=", "FA"]],
      "saldo"
    );
    saldoCheck.total.should.equal(0.13);
    saldoCheck.activo.should.equal(1);

    var saldoNCChecks = await Query.byFiltersAll(
      [["saldo.clienteId", "=", cliente.id], ["saldo.activo", "=", false], ["saldo.tipo", "=", "NC"]],
      "saldo"
    );
    var saldoNCCheck = saldoNCChecks[0];
    saldoNCCheck.total.should.equal(0);
    saldoNCCheck.activo.should.equal(0);

    var saldoNCCheck2 = saldoNCChecks[1];
    saldoNCCheck2.total.should.equal(0);
    saldoNCCheck2.activo.should.equal(0);

    pago.monto.should.equal(0);
    var pagoLineas = await Query.byFiltersAll([["pagoDocumentoId", "=", pago.id]], "lineaPagoDocumento");
    //pagoLineas[0].documentoId.should.equal(saldo.documentoId);
    pagoLineas[0].monto.should.equal(1);

    //pagoLineas[1].documentoId.should.equal(saldoNCCheck.documentoId);
    pagoLineas[1].monto.should.equal(-0.5);

    pagoLineas[2].documentoId.should.equal(saldoNCCheck2.documentoId);
    pagoLineas[2].monto.should.equal(-0.5);

    var saldoFin = await Query.byFiltersOne(
      [["saldo.clienteId", "=", cliente.id], ["saldo.activo", "=", true], ["saldo.tipo", "=", "FA"]],
      "saldo"
    );

    saldoFin.total.should.equal(0.13);

    return true;
  });

  it("Facturar Orden contado con 2 facturas", async function() {
    var orden, orden1;

    var cliente = await Cliente();
    var producto = await ProductoWithInventarioAndPrecio();

    orden = await Orden({ clienteId: cliente.id, plazo: 22 }, [{ ...producto, cantidad: 1 }]);
    orden = await ImprimirOrden(orden);

    orden1 = await Orden({ clienteId: cliente.id, plazo: 14 }, [{ ...producto, cantidad: 1 }]);
    orden1 = await ImprimirOrden(orden1);

    var saldoInit = await Query.byFiltersAll(
      [["saldo.clienteId", "=", cliente.id], ["saldo.tipo", "=", "FA"]],
      "saldo"
    );

    var pago = await Pago(
      { clienteId: cliente.id },
      saldoInit.map(fa => {
        return { id: fa.documentoId, monto: fa.totalComprobante, _saldoId: fa.id };
      })
    );

    var saldoChecks = await Query.byFiltersAll(
      [["saldo.clienteId", "=", cliente.id], ["saldo.activo", "=", false], ["saldo.tipo", "=", "FA"]],
      "saldo"
    );
    var saldoCheck = saldoChecks[0];
    saldoCheck.total.should.equal(0);
    saldoCheck.activo.should.equal(0);

    var saldoCheck2 = saldoChecks[1];
    saldoCheck2.total.should.equal(0);
    saldoCheck2.activo.should.equal(0);

    pago.monto.should.equal(2.26);
    var pagoLineas = await Query.byFiltersAll([["pagoDocumentoId", "=", pago.id]], "lineaPagoDocumento");
    //pagoLineas[0].documentoId.should.equal(saldo.documentoId);
    pagoLineas[0].monto.should.equal(1.13);

    //pagoLineas[1].documentoId.should.equal(saldoNCCheck.documentoId);
    pagoLineas[1].monto.should.equal(1.13);

    var saldoFin = await Query.byFiltersOne(
      [["saldo.clienteId", "=", cliente.id], ["saldo.activo", "=", false], ["saldo.tipo", "=", "FA"]],
      "saldo"
    );

    saldoFin.total.should.equal(0);

    return true;
  });
});

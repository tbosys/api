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

describe("Pagos de Contado", () => {
  before(() => {
    this.timeout = 10000;
    process.env.TESTING = true;
  });
  it("Facturar Orden contado", async function() {
    var orden;

    var cliente = await Cliente({ creditoPlazo: 0, creditoLimite: 0, ownerId: 2 });
    var producto = await ProductoWithInventarioAndPrecio();

    orden = await Orden({ clienteId: cliente.id, plazo: 0 }, [{ ...producto, cantidad: 1 }]);
    orden = await ImprimirOrden(orden);

    var saldo = await Query.byValue("saldo", "clienteId", cliente.id);
    saldo.total.should.equal(1.13);

    await Execute(
      {
        ids: { id: saldo.id, notasCredito: [], formaPago: "tarjeta", referencia: "ffff" }
      },
      "saldo",
      "pagar"
    );

    var saldoCheck = await Query.byFiltersOne(
      [["saldo.clienteId", "=", cliente.id], ["saldo.activo", "=", false]],
      "saldo"
    );
    saldoCheck.total.should.equal(0);
    saldoCheck.activo.should.equal(0);

    var pago = await Query.byFiltersOne([["pagoDocumento.clienteId", "=", cliente.id]], "pagoDocumento");
    pago.monto.should.equal(1.13);
    pago.ownerId.should.equal(2);

    var pagoLineas = await Query.byFiltersAll([["pagoDocumentoId", "=", pago.id]], "lineaPagoDocumento");
    pagoLineas[0].documentoId.should.equal(saldo.documentoId);
    pagoLineas[0].monto.should.equal(saldo.total);
    pagoLineas[0].ownerId.should.equal(2);
    return true;
  });

  it("Facturar Orden contado con NC vieja - Pago Total", async function() {
    var orden;

    var cliente = await Cliente({ creditoPlazo: 0, creditoLimite: 0 });
    var producto = await ProductoWithInventarioAndPrecio();

    orden = await Orden({ clienteId: cliente.id, plazo: 0 }, [{ ...producto, cantidad: 1 }]);
    orden = await ImprimirOrden(orden);

    var saldo = await Query.byValue("saldo", "clienteId", cliente.id);
    saldo.total.should.equal(1.13);
    await Nota("NC", { clienteId: cliente.id, totalComprobante: 1.13 });

    await Execute(
      {
        ids: { id: saldo.id, notasCredito: [], formaPago: "tarjeta", referencia: "ffff" }
      },
      "saldo",
      "pagar"
    );

    var saldoCheck = await Query.byFiltersOne(
      [["saldo.clienteId", "=", cliente.id], ["saldo.activo", "=", false]],
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

    var pago = await Query.byFiltersOne([["pagoDocumento.clienteId", "=", cliente.id]], "pagoDocumento");
    pago.monto.should.equal(0);

    var pagoLineas = await Query.byFiltersAll([["pagoDocumentoId", "=", pago.id]], "lineaPagoDocumento");
    pagoLineas[0].documentoId.should.equal(saldo.documentoId);
    pagoLineas[0].monto.should.equal(saldo.total);

    pagoLineas[1].documentoId.should.equal(saldoNCCheck.documentoId);
    pagoLineas[1].monto.should.equal(saldo.total * -1);

    return true;
  });

  it("Facturar Orden contado con NC vieja - NC mas grande", async function() {
    var orden;

    var cliente = await Cliente({ creditoPlazo: 0, creditoLimite: 0 });
    var producto = await ProductoWithInventarioAndPrecio();

    orden = await Orden({ clienteId: cliente.id, plazo: 0 }, [{ ...producto, cantidad: 1 }]);
    orden = await ImprimirOrden(orden);

    var saldo = await Query.byValue("saldo", "clienteId", cliente.id);
    saldo.total.should.equal(1.13);
    await Nota("NC", { clienteId: cliente.id, totalComprobante: 2.13 });

    await Execute(
      {
        ids: { id: saldo.id, notasCredito: [], formaPago: "tarjeta", referencia: "ffff" }
      },
      "saldo",
      "pagar"
    );

    var saldoCheck = await Query.byFiltersOne(
      [["saldo.clienteId", "=", cliente.id], ["saldo.activo", "=", false]],
      "saldo"
    );
    saldoCheck.total.should.equal(0);
    saldoCheck.activo.should.equal(0);

    var saldoNCCheck = await Query.byFiltersOne(
      [["saldo.clienteId", "=", cliente.id], ["saldo.tipo", "=", "NC"]],
      "saldo"
    );
    saldoNCCheck.total.should.equal(-1);
    saldoNCCheck.activo.should.equal(1);

    var pago = await Query.byFiltersOne([["pagoDocumento.clienteId", "=", cliente.id]], "pagoDocumento");
    pago.monto.should.equal(0);

    var pagoLineas = await Query.byFiltersAll([["pagoDocumentoId", "=", pago.id]], "lineaPagoDocumento");
    pagoLineas[0].documentoId.should.equal(saldo.documentoId);
    pagoLineas[0].monto.should.equal(saldo.total);

    pagoLineas[1].documentoId.should.equal(saldoNCCheck.documentoId);
    pagoLineas[1].monto.should.equal(saldo.total * -1);

    return true;
  });

  it("Facturar Orden contado con NC vieja - NC mas pequeña", async function() {
    var orden;

    var cliente = await Cliente({ creditoPlazo: 0, creditoLimite: 0 });
    var producto = await ProductoWithInventarioAndPrecio();

    orden = await Orden({ clienteId: cliente.id, plazo: 0 }, [{ ...producto, cantidad: 1 }]);
    orden = await ImprimirOrden(orden);

    var saldo = await Query.byValue("saldo", "clienteId", cliente.id);
    saldo.total.should.equal(1.13);
    await Nota("NC", { clienteId: cliente.id, totalComprobante: 0.13 });

    await Execute(
      {
        ids: { id: saldo.id, notasCredito: [], formaPago: "tarjeta", referencia: "ffff" }
      },
      "saldo",
      "pagar"
    );

    var saldoCheck = await Query.byFiltersOne(
      [["saldo.clienteId", "=", cliente.id], ["saldo.activo", "=", false], ["saldo.tipo", "=", "FA"]],
      "saldo"
    );
    saldoCheck.total.should.equal(0);
    saldoCheck.activo.should.equal(0);

    var saldoNCCheck = await Query.byFiltersOne(
      [["saldo.clienteId", "=", cliente.id], ["saldo.activo", "=", 0], ["saldo.tipo", "=", "NC"]],
      "saldo"
    );
    saldoNCCheck.total.should.equal(0);
    saldoNCCheck.activo.should.equal(0);

    var pago = await Query.byFiltersOne([["pagoDocumento.clienteId", "=", cliente.id]], "pagoDocumento");
    pago.monto.should.equal(1);

    var pagoLineas = await Query.byFiltersAll([["pagoDocumentoId", "=", pago.id]], "lineaPagoDocumento");
    pagoLineas[0].documentoId.should.equal(saldo.documentoId);
    pagoLineas[0].monto.should.equal(saldo.total);

    pagoLineas[1].documentoId.should.equal(saldoNCCheck.documentoId);
    pagoLineas[1].monto.should.equal(-0.13);

    return true;
  });

  it("Facturar Orden contado con NC vieja - 2 NC mas pequeña", async function() {
    var orden;

    var cliente = await Cliente({ creditoPlazo: 0, creditoLimite: 0 });
    var producto = await ProductoWithInventarioAndPrecio();

    orden = await Orden({ clienteId: cliente.id, plazo: 0 }, [{ ...producto, cantidad: 1 }]);
    orden = await ImprimirOrden(orden);

    var saldo = await Query.byValue("saldo", "clienteId", cliente.id);
    saldo.total.should.equal(1.13);
    await Nota("NC", { clienteId: cliente.id, totalComprobante: 0.13 });
    await Nota("NC", { clienteId: cliente.id, totalComprobante: 0.13 });

    await Execute(
      {
        ids: { id: saldo.id, notasCredito: [], formaPago: "tarjeta", referencia: "ffff" }
      },
      "saldo",
      "pagar"
    );

    var saldoCheck = await Query.byFiltersOne(
      [["saldo.clienteId", "=", cliente.id], ["saldo.activo", "=", false], ["saldo.tipo", "=", "FA"]],
      "saldo"
    );
    saldoCheck.total.should.equal(0);
    saldoCheck.activo.should.equal(0);

    var saldoNCChecks = await Query.byFiltersAll(
      [["saldo.clienteId", "=", cliente.id], ["saldo.activo", "=", 0], ["saldo.tipo", "=", "NC"]],
      "saldo"
    );
    var saldoNCCheck = saldoNCChecks[0];
    var saldoNCCheck2 = saldoNCChecks[1];

    saldoNCCheck.total.should.equal(0);
    saldoNCCheck.activo.should.equal(0);

    saldoNCCheck2.total.should.equal(0);
    saldoNCCheck2.activo.should.equal(0);

    var pago = await Query.byFiltersOne([["pagoDocumento.clienteId", "=", cliente.id]], "pagoDocumento");
    pago.monto.should.equal(0.87);

    var pagoLineas = await Query.byFiltersAll([["pagoDocumentoId", "=", pago.id]], "lineaPagoDocumento");
    pagoLineas[0].documentoId.should.equal(saldo.documentoId);
    pagoLineas[0].monto.should.equal(saldo.total);

    pagoLineas[1].documentoId.should.equal(saldoNCCheck.documentoId);
    pagoLineas[1].monto.should.equal(-0.13);

    pagoLineas[2].documentoId.should.equal(saldoNCCheck2.documentoId);
    pagoLineas[2].monto.should.equal(-0.13);

    return true;
  });

  it("Facturar Orden contado con NC vieja - 1 NC mas pequeña 1 mas grande", async function() {
    var orden;

    var cliente = await Cliente({ creditoPlazo: 0, creditoLimite: 0 });
    var producto = await ProductoWithInventarioAndPrecio();

    orden = await Orden({ clienteId: cliente.id, plazo: 0 }, [{ ...producto, cantidad: 1 }]);
    orden = await ImprimirOrden(orden);

    var saldo = await Query.byValue("saldo", "clienteId", cliente.id);
    saldo.total.should.equal(1.13);
    await Nota("NC", { clienteId: cliente.id, totalComprobante: 0.13 });
    await Nota("NC", { clienteId: cliente.id, totalComprobante: 1000.13 });

    await Execute(
      {
        ids: { id: saldo.id, notasCredito: [], formaPago: "tarjeta", referencia: "ffff" }
      },
      "saldo",
      "pagar"
    );

    var saldoCheck = await Query.byFiltersOne(
      [["saldo.clienteId", "=", cliente.id], ["saldo.activo", "=", false], ["saldo.tipo", "=", "FA"]],
      "saldo"
    );
    saldoCheck.total.should.equal(0);
    saldoCheck.activo.should.equal(0);

    var saldoNCCheck = await Query.byFiltersOne(
      [["saldo.clienteId", "=", cliente.id], ["saldo.activo", "=", 0], ["saldo.tipo", "=", "NC"]],
      "saldo"
    );

    var saldoNCCheck2 = await Query.byFiltersOne(
      [["saldo.clienteId", "=", cliente.id], ["saldo.activo", "=", 1], ["saldo.tipo", "=", "NC"]],
      "saldo"
    );

    saldoNCCheck.total.should.equal(0);
    saldoNCCheck.activo.should.equal(0);

    saldoNCCheck2.total.should.equal(-999.13);
    saldoNCCheck2.activo.should.equal(1);

    var pago = await Query.byFiltersOne([["pagoDocumento.clienteId", "=", cliente.id]], "pagoDocumento");
    pago.monto.should.equal(0);

    var pagoLineas = await Query.byFiltersAll([["pagoDocumentoId", "=", pago.id]], "lineaPagoDocumento");
    pagoLineas[0].documentoId.should.equal(saldo.documentoId);
    pagoLineas[0].monto.should.equal(saldo.total);

    pagoLineas[1].documentoId.should.equal(saldoNCCheck.documentoId);
    pagoLineas[1].monto.should.equal(-0.13);

    pagoLineas[2].documentoId.should.equal(saldoNCCheck2.documentoId);
    pagoLineas[2].monto.should.equal(-1);

    return true;
  });

  it("Facturar Orden contado con NC vieja - 1 NC mas pequeña 1 mas grande in order", async function() {
    var orden;

    var cliente = await Cliente({ creditoPlazo: 0, creditoLimite: 0, ownerId: 2 });
    var producto = await ProductoWithInventarioAndPrecio();

    orden = await Orden({ clienteId: cliente.id, plazo: 0 }, [{ ...producto, cantidad: 1 }]);
    orden = await ImprimirOrden(orden);

    var saldo = await Query.byValue("saldo", "clienteId", cliente.id);
    saldo.total.should.equal(1.13);
    await Nota("NC", { clienteId: cliente.id, totalComprobante: 1000.13 });
    await Nota("NC", { clienteId: cliente.id, totalComprobante: 0.13 });

    await Execute(
      {
        ids: { id: saldo.id, notasCredito: [], formaPago: "tarjeta", referencia: "ffff" }
      },
      "saldo",
      "pagar"
    );

    var saldoCheck = await Query.byFiltersOne(
      [["saldo.clienteId", "=", cliente.id], ["saldo.activo", "=", false], ["saldo.tipo", "=", "FA"]],
      "saldo"
    );
    saldoCheck.total.should.equal(0);
    saldoCheck.activo.should.equal(0);

    var saldoNCChecks = await Query.byFiltersAll(
      [["saldo.clienteId", "=", cliente.id], ["saldo.activo", "=", 1], ["saldo.tipo", "=", "NC"]],
      "saldo"
    );
    var saldoTotal = 0;

    saldoNCChecks.forEach(saldo => {
      saldoTotal += saldo.total;
    });

    saldoTotal.should.equal(-999.13);

    var pago = await Query.byFiltersOne([["pagoDocumento.clienteId", "=", cliente.id]], "pagoDocumento");
    pago.monto.should.equal(0);

    var pagoLineas = await Query.byFiltersAll([["pagoDocumentoId", "=", pago.id]], "lineaPagoDocumento");
    pagoLineas[0].documentoId.should.equal(saldo.documentoId);
    pagoLineas[0].monto.should.equal(saldo.total);

    pagoLineas[1].monto.should.equal(-1.13);
    pagoLineas[1].ownerId.should.equal(2);
    return true;
  });
});

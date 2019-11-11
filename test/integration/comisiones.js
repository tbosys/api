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

describe("Comisiones", () => {
  before(() => {
    this.timeout = 10000;
    process.env.TESTING = true;
  });
  it("venta normal", async function() {
    this.timeout = 10000;
    var cliente = await Cliente({ ownerId: 3 });
    var producto = await ProductoWithInventarioAndPrecio();
    var producto2 = await ProductoWithInventarioAndPrecio({ name: "p2", codigo: "444" });

    var orden = await Orden({ clienteId: cliente.id }, [
      { ...producto, cantidad: 1 },
      { ...producto2, cantidad: 1 }
    ]);
    orden = await ImprimirOrden(orden);
    var movimientos = await Query.byFiltersAll(
      [["movimientoInventario.clienteId", "=", cliente.id]],
      "movimientoInventario"
    );

    var documento = await Query.byValue("documento", "ordenId", orden.id);
    var comisiones = await Query.byFiltersAll(
      [["movimientoInventarioId", "IN", movimientos.map(m => m.id)], ["comisionHistorico.ownerId", "=", 3]],
      "comisionHistorico"
    );

    comisiones.map(comision => comision.monto.should.equal(0.01));
    return true;
  });

  it("devolucion", async function() {
    var cliente = await Cliente({ ownerId: 3 });
    var producto = await ProductoWithInventarioAndPrecio();
    var producto2 = await ProductoWithInventarioAndPrecio({ name: "p2", codigo: "444" });

    var orden = await Orden({ clienteId: cliente.id }, [
      { ...producto, cantidad: 1 },
      { ...producto2, cantidad: 1 }
    ]);
    orden = await ImprimirOrden(orden);

    var documento = await Query.byValue("documento", "ordenId", orden.id);
    var movimientos = await Query.byFiltersAll([["documentoId", "=", documento.id]], "movimientoInventario");

    movimientos.forEach(m => m.ownerId.should.equal(3));

    var boleta = await Execute(
      {
        ids: {
          boleta: "333",
          descripcion: "dfdfd",
          items: [{ id: movimientos[0].id, cantidad: 1 }, { id: movimientos[1].id, cantidad: 1 }]
        }
      },
      "movimientoInventario",
      "devolver"
    );

    await Execute({ ids: [boleta.id] }, "boleta", "aprobar");
    await Execute({ ids: [boleta.id] }, "boleta", "aplicar");

    movimientos = await Query.byFiltersAll(
      [["movimientoInventario.clienteId", "=", cliente.id]],
      "movimientoInventario"
    );

    var comisiones = await Query.byFiltersAll(
      [["movimientoInventarioId", "IN", movimientos.map(m => m.id)], ["comisionHistorico.ownerId", "=", 3]],
      "comisionHistorico"
    );

    comisiones.length.should.equal(4);
    var total = 0;
    comisiones.map(comision => (total += comision.monto));
    total.should.equal(0);
    return true;
  });

  it("Anular Documento", async function() {
    var orden;

    var cliente = await Cliente({ ownerId: 3 });
    var producto = await ProductoWithInventarioAndPrecio();

    orden = await Orden({ clienteId: cliente.id }, [{ ...producto, cantidad: 1 }]);
    orden = await ImprimirOrden(orden);

    var saldo = await Query.byValue("saldo", "clienteId", cliente.id);
    var documento = await Query.byValue("documento", "ordenId", orden.id);
    await Execute({ ids: [documento.id] }, "documento", "anular");

    var movimientos = await Query.byFiltersAll(
      [["movimientoInventario.clienteId", "=", cliente.id]],
      "movimientoInventario"
    );

    var comisiones = await Query.byFiltersAll(
      [["movimientoInventarioId", "IN", movimientos.map(m => m.id)], ["comisionHistorico.ownerId", "=", 3]],
      "comisionHistorico"
    );

    comisiones.forEach(comision => {
      comision.monto.should.be.within(-0.01, 0.01);
    });
    comisiones.length.should.equal(2);
    var total = 0;
    comisiones.map(comision => (total += comision.monto));
    total.should.equal(0);
  });

  it("Pago de credito de una factura", async function() {
    before(() => {
      this.timeout = 10000;
      process.env.TESTING = true;
    });

    var cliente = await Cliente({ ownerId: 3 });
    var producto = await ProductoWithInventarioAndPrecio();

    var orden = await Orden({ clienteId: cliente.id }, [{ ...producto, cantidad: 1 }]);
    orden = await ImprimirOrden(orden);

    var saldo = await Query.byValue("saldo", "clienteId", cliente.id);
    saldo.total.should.equal(1.13);

    var pago = await Pago({ clienteId: cliente.id }, [{ id: saldo.documentoId, monto: saldo.total }]);
    pago.ownerId.should.equal(3);

    var pagoLineas = await Query.byFiltersAll([["pagoDocumentoId", "=", pago.id]], "lineaPagoDocumento");
    pagoLineas[0].documentoId.should.equal(saldo.documentoId);
    pagoLineas[0].monto.should.equal(saldo.total);
    pagoLineas[0].ownerId.should.equal(3);

    var comisiones = await Query.byFiltersAll(
      [["lineaPagoDocumentoId", "IN", pagoLineas.map(m => m.id)], ["comisionHistorico.ownerId", "=", 3]],
      "comisionHistorico"
    );

    comisiones.map(comision => comision.monto.should.equal(0.01));
    return true;
  });
});

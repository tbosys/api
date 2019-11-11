process.env.NODE_ENV = process.env.NODE_ENV || "development";

var chai = require("chai");
chai.should();
var Execute = require("../helpers/context");
var ProductoWithInventarioAndPrecio = require("../helpers/combo/productoWithInventarioAndPrecio");
var Cliente = require("../helpers/objects/cliente");
var Orden = require("../helpers/objects/orden");
var Query = require("../helpers/query");
var Nota = require("../helpers/objects/nota");

var DevolverPago = require("../helpers/combo/devolverPago");

var ImprimirOrden = require("../helpers/combo/imprimirOrden");

describe("Devolver de Contado", () => {
  before(() => {
    this.timeout = 10000;
    process.env.TESTING = true;
  });
  it("Facturar Orden contado con NC vieja - Pago Total", async function() {
    var orden;

    var cliente = await Cliente({ creditoPlazo: 0, creditoLimite: 0, ownerId: 2 });
    var producto = await ProductoWithInventarioAndPrecio();

    orden = await Orden({ clienteId: cliente.id, plazo: 0 }, [{ ...producto, cantidad: 1 }]);
    orden = await ImprimirOrden(orden);

    //    await Nota("NC", { clienteId: cliente.id, totalComprobante: 1.13 });
    var saldo = await Query.byValue("saldo", "clienteId", cliente.id);
    saldo.total.should.equal(1.13);

    await Execute(
      {
        ids: { id: saldo.id, notasCredito: [], formaPago: "tarjeta", referencia: "ffff" }
      },
      "saldo",
      "pagar"
    );

    var pagos = await DevolverPago(cliente.id);

    saldo = await Query.byValue("saldo", "clienteId", cliente.id);
    saldo.total.should.equal(1.13);

    pagos.original.monto.should.equal(1.13);
    pagos.devuelto.monto.should.equal(-1.13);
    pagos.original.ownerId.should.equal(2);
    pagos.devuelto.ownerId.should.equal(2);

    return true;
  });
});

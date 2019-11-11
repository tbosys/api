process.env.NODE_ENV = process.env.NODE_ENV || "development";

var chai = require("chai");
chai.should();
var Execute = require("../helpers/context");
var ProductoWithInventarioAndPrecio = require("../helpers/combo/productoWithInventarioAndPrecio");
var Cliente = require("../helpers/objects/cliente");
var Orden = require("../helpers/objects/orden");
var Query = require("../helpers/query");

var ImprimirOrden = require("../helpers/combo/imprimirOrden");

describe("Documentos Devolver", () => {
  before(() => {
    this.timeout = 10000;
    process.env.TESTING = true;
  });
  it("Devolucion", async function() {
    var cliente = await Cliente({ ownerId: 2 });
    var producto = await ProductoWithInventarioAndPrecio();
    var producto2 = await ProductoWithInventarioAndPrecio({ name: "p2", codigo: "444" });

    var orden = await Orden({ clienteId: cliente.id }, [
      { ...producto, cantidad: 1 },
      { ...producto2, cantidad: 1 }
    ]);
    orden = await ImprimirOrden(orden);

    var documento = await Query.byValue("documento", "ordenId", orden.id);
    var movimientos = await Query.byFiltersAll([["documentoId", "=", documento.id]], "movimientoInventario");

    movimientos.forEach(m => m.ownerId.should.equal(2));

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

    var saldoNC = await Query.byFiltersOne(
      [["saldo.clienteId", "=", cliente.id], ["saldo.tipo", "=", "NC"]],
      "saldo"
    );
    saldoNC.total.should.equal(-2.26);
    saldoNC.ownerId.should.equal(2);
    var documentoFa = await Query.byValue("documento", "ordenId", orden.id);
    documentoFa.ownerId.should.equal(2);
    documentoFa.totalComprobante.should.equal(2.26);
    //documentoFa.anulacion.should.equal(1); //Documento devuelto no se puede anular;

    var documentoNC = await Query.byId("documento", saldoNC.documentoId);
    documentoNC.clienteId.should.equal(cliente.id);
    documentoNC.ownerId.should.equal(2);
    documentoNC.totalComprobante.should.equal(-2.26);
    documentoNC.totalImpuesto.should.equal(-0.26);

    var productoCheck = await Query.byId("producto", producto.id);
    productoCheck.inventario.should.equal(1000);

    var movimientos2 = await Query.byFiltersAll(
      [["documento.clienteId", "=", cliente.id]],
      "movimientoInventario"
    );

    movimientos2.forEach(m => m.ownerId.should.equal(2));
    return true;
  });

  it("Devolucion more cantidad", async function() {
    var cliente = await Cliente();
    var producto = await ProductoWithInventarioAndPrecio();

    var orden = await Orden({ clienteId: cliente.id }, [{ ...producto, cantidad: 1 }]);
    orden = await ImprimirOrden(orden);

    var documento = await Query.byValue("documento", "ordenId", orden.id);
    var movimientos = await Query.byFiltersAll([["documentoId", "=", documento.id]], "movimientoInventario");
    var errored = false;
    try {
      var boleta = await Execute(
        {
          ids: {
            boleta: "333",
            descripcion: "dfdfd",
            items: [{ id: movimientos[0].id, cantidad: 100 }]
          }
        },
        "movimientoInventario",
        "devolver"
      );
    } catch (e) {
      errored = true;
    }

    return errored.should.be.true;
  });
});

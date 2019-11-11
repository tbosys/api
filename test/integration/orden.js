process.env.NODE_ENV = process.env.NODE_ENV || "development";

var chai = require("chai");
chai.should();
var Execute = require("../helpers/context");
var ProductoWithInventarioAndPrecio = require("../helpers/combo/productoWithInventarioAndPrecio");
var Cliente = require("../helpers/objects/cliente");
var Orden = require("../helpers/objects/orden");
var Query = require("../helpers/query");
var Producto = require("../helpers/objects/producto");

var ImprimirOrden = require("../helpers/combo/imprimirOrden");

describe("Ordenes", () => {
  before(() => {
    this.timeout = 10000;
    process.env.TESTING = true;
  });
  it("Facturar Orden credito con dos productos", async function() {
    var orden;

    var cliente = await Cliente({ ownerId: 2 });
    var producto = await ProductoWithInventarioAndPrecio();
    var producto2 = await ProductoWithInventarioAndPrecio({ name: "producto2", codigo: "5" });

    orden = await Orden({ clienteId: cliente.id }, [
      { ...producto, cantidad: 1 },
      { ...producto2, cantidad: 1 }
    ]);
    orden.ownerId.should.equal(2);
    orden.especial.should.be.false;
    orden.total.should.equal(2.26);
    orden.impuesto.should.equal(0.26);
    orden.subTotal.should.equal(2);
    orden.descuento.should.equal(0);
    orden = await ImprimirOrden(orden);

    var productoCheck = await Query.byId("producto", producto.id);
    productoCheck.inventario.should.equal(999);

    var productoCheck2 = await Query.byId("producto", producto2.id);
    productoCheck2.inventario.should.equal(999);

    var saldo = await Query.byValue("saldo", "clienteId", cliente.id);
    saldo.total.should.equal(2.26);

    var documentoCheck = await Query.byValue("documento", "clienteId", cliente.id);
    var movimientos = await Query.byFiltersAll(
      [["documento.clienteId", "=", cliente.id]],
      "movimientoInventario"
    );

    documentoCheck.ownerId.should.equal(2);
    movimientos.forEach(m => m.ownerId.should.equal(2));

    return true;
  });

  it("Facturar Orden contado", async function() {
    var orden;

    var cliente = await Cliente({ creditoPlazo: 0, creditoLimite: 0 });
    var producto = await ProductoWithInventarioAndPrecio();

    orden = await Orden({ clienteId: cliente.id, plazo: 0 }, [{ ...producto, cantidad: 1 }]);
    orden.especial.should.be.false;

    orden.total.should.equal(1.13);
    orden.impuesto.should.equal(0.13);
    orden.subTotal.should.equal(1);
    orden.descuento.should.equal(0);
    orden = await ImprimirOrden(orden);

    var productoCheck = await Query.byId("producto", producto.id);
    productoCheck.inventario.should.equal(999);

    var saldo = await Query.byValue("saldo", "clienteId", cliente.id);
    saldo.total.should.equal(1.13);

    var documentoCheck = await Query.byValue("documento", "ordenId", orden.id);

    documentoCheck.plazo.should.equal(0);

    return true;
  });

  it("Facturar Orden contado a un cliente de credito", async function() {
    var orden;

    var cliente = await Cliente({ creditoPlazo: 30, creditoLimite: 1133330 });
    var producto = await ProductoWithInventarioAndPrecio();
    var error = false;
    try {
      orden = await Orden({ clienteId: cliente.id, plazo: 0 }, [{ ...producto, cantidad: 1 }]);
    } catch (e) {
      error = true;
    }

    error.should.be.true;

    return true;
  });

  it("Facturar un servicio", async function() {
    var orden;

    var cliente = await Cliente();
    var producto = await Producto({ mercancia: false, name: "Servicio 1", unidadMedida: "Sp" });

    orden = await Orden({ clienteId: cliente.id }, [{ ...producto, cantidad: 1 }]);
    orden.especial.should.be.false;
    orden.total.should.equal(1.13);
    orden.impuesto.should.equal(0.13);
    orden.subTotal.should.equal(1);
    orden.descuento.should.equal(0);
    orden = await ImprimirOrden(orden);

    var productoCheck = await Query.byId("producto", producto.id);
    productoCheck.inventario.should.equal(0);

    var saldo = await Query.byValue("saldo", "clienteId", cliente.id);
    saldo.total.should.equal(1.13);

    return true;
  });

  it("Facturar un producto Excento", async function() {
    var orden;

    var cliente = await Cliente();
    var producto = await ProductoWithInventarioAndPrecio({ impuesto: 0 });

    orden = await Orden({ clienteId: cliente.id }, [{ ...producto, cantidad: 1 }]);
    orden.especial.should.be.false;
    orden.total.should.equal(1);
    orden.impuesto.should.equal(0);
    orden.subTotal.should.equal(1);
    orden.descuento.should.equal(0);
    orden = await ImprimirOrden(orden);

    var productoCheck = await Query.byId("producto", producto.id);
    productoCheck.inventario.should.equal(999);

    var saldo = await Query.byValue("saldo", "clienteId", cliente.id);
    saldo.total.should.equal(1);

    return true;
  });

  it("Facturar una orden con cantidad", async function() {
    var orden;

    var cliente = await Cliente();
    var producto = await ProductoWithInventarioAndPrecio();

    orden = await Orden({ clienteId: cliente.id }, [
      { ...producto, cantidad: 100, especial: true, descuento: 1 }
    ]);
    orden.especial.should.be.true;
    orden.total.should.equal(111.87);
    orden.impuesto.should.equal(12.87);
    orden.subTotal.should.equal(100);
    orden.descuento.should.equal(1);
    orden = await ImprimirOrden(orden);

    var productoCheck = await Query.byId("producto", producto.id);
    productoCheck.inventario.should.equal(900);

    var saldo = await Query.byValue("saldo", "clienteId", cliente.id);
    saldo.total.should.equal(111.87);

    return true;
  });

  it("Facturar una orden con cantidad negociado", async function() {
    var orden;

    var cliente = await Cliente();
    var producto = await ProductoWithInventarioAndPrecio();

    orden = await Orden({ clienteId: cliente.id }, [{ ...producto, cantidad: 100, descuento: 10 }]);
    orden.negociado.should.be.true;
    orden.total.should.equal(101.7);
    orden.impuesto.should.equal(11.7);
    orden.subTotal.should.equal(100);
    orden.descuento.should.equal(10);
    orden = await ImprimirOrden(orden);

    var productoCheck = await Query.byId("producto", producto.id);
    productoCheck.inventario.should.equal(900);

    var saldo = await Query.byValue("saldo", "clienteId", cliente.id);
    saldo.total.should.equal(101.7);

    return true;
  });

  it("modificar orden y el estado regresa a por aplicar", async function() {
    var orden;

    var cliente = await Cliente();
    var producto = await ProductoWithInventarioAndPrecio();

    orden = await Orden({ clienteId: cliente.id }, [{ ...producto, cantidad: 100 }]);
    var ordenCheck = await Query.byId("orden", orden.id);

    if (ordenCheck.estado == "por activar") {
      await Execute({ ids: [orden.id] }, "orden", "activar");
      ordenCheck = await Query.byId("orden", orden.id);
    }
    if (ordenCheck.estado == "por aprobar") {
      await Execute({ ids: [orden.id] }, "orden", "aprobar");
      ordenCheck = await Query.byId("orden", orden.id);
    }

    await Execute(
      { id: ordenCheck.id, fuente: "ventas", updatedAt: ordenCheck.updatedAt },
      "orden",
      "update"
    );
    ordenCheck = await Query.byId("orden", orden.id);
    ordenCheck.estado.should.equal("por aplicar");

    return;
  });

  it("Facturar Orden con un precio especial", async function() {
    var orden;

    var cliente = await Cliente();
    var producto = await ProductoWithInventarioAndPrecio();

    orden = await Orden({ clienteId: cliente.id }, [
      { ...producto, especial: true, cantidad: 100, precio: 2 }
    ]);
    orden.especial.should.be.true;
    orden = await ImprimirOrden(orden);

    var productoCheck = await Query.byId("producto", producto.id);
    productoCheck.inventario.should.equal(900);

    var saldo = await Query.byValue("saldo", "clienteId", cliente.id);
    saldo.total.should.equal(226);

    return;
  });

  it("Facturar con cambios al cliente", async function() {
    var orden;
    var cliente = await Cliente();
    var producto = await ProductoWithInventarioAndPrecio();

    orden = await Orden({ cedula: "111050279", clienteId: cliente.id }, [
      { ...producto, cantidad: 100, precio: 2 }
    ]);
    orden = await ImprimirOrden(orden);

    var clienteCheck = await Query.byId("cliente", cliente.id);
    clienteCheck.cedula.should.equal("111050279");

    return;
  });

  it("Facturar con excentos", async function() {
    var orden;
    var cliente = await Cliente();
    var producto = await ProductoWithInventarioAndPrecio();

    orden = await Orden(
      {
        excento: 3607.5,
        excentoFecha: "2019-04-01",
        excentoInstitucion: "ccdff",
        excentoNumero: "443444",
        excentoPorcentaje: 50,
        excentoTipo: "01",
        clienteId: cliente.id
      },
      [{ ...producto, cantidad: 1 }]
    );
    orden = await ImprimirOrden(orden);

    orden.impuesto.should.equal(0.065);
    orden.excento.should.equal(0.065);

    return;
  });

  it("Facturar orden sin Cliente", async function() {
    var orden;
    var catched = false;
    try {
      var cliente = await Cliente();
      var producto = await Producto({ mercancia: false, name: "Servicio 1", unidadMedida: "Sp" });

      orden = await Orden({ clienteId: null }, [{ ...producto, cantidad: 1 }]);
      orden.especial.should.be.false;
      orden.total.should.equal(1.13);
      orden.impuesto.should.equal(0.13);
      orden.subTotal.should.equal(1);
      orden.descuento.should.equal(0);
      orden = await ImprimirOrden(orden);

      var productoCheck = await Query.byId("producto", producto.id);
      productoCheck.inventario.should.equal(0);

      var saldo = await Query.byValue("saldo", "clienteId", cliente.id);
      saldo.total.should.equal(1.13);
    } catch (e) {
      catched = true;
    }
    return catched.should.be.true;
  });
});

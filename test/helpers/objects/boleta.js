var Execute = require("../context");

module.exports = async function(type, body = {}, productos = []) {
  var boletaBody = {
    referencia: "fff",
    tipo: "CO",
    movimientoInventario: productos.map(producto => ({
      productoId: producto.id,
      mercancia: true,
      cantidad: producto.cantidad || 1000,
      costo: producto.costo || 100
    })),
    ...body
  };
  var boleta = await Execute(boletaBody, "boleta", "create");
  await Execute({ ids: [boleta.id] }, "boleta", "aprobar");
  await Execute({ ids: [boleta.id] }, "boleta", "aplicar");
  return boleta;
};

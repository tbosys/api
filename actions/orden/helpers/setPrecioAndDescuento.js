module.exports = function setPrecioAndDescuento(cliente, producto) {
  var cliente = cliente.length > 0 ? cliente[0] : cliente;
  var clienteGrupos = cliente.grupos || [];
  if (!cliente.descuentos) cliente.descuentos = {};
  var precios = producto.precios;
  let precioRetail = null;
  let descuentoRetail = null;
  var preciosMap = new Map(
    precios.map(i => {
      if ((i.name || "").toLowerCase() == "retail") precioRetail = i;
      return [i.grupoId, i];
    })
  );
  var descuentos = producto.descuentos;
  var descuentosMap = new Map(
    descuentos.map(i => {
      if ((i.name || "").toLowerCase() == "retail") descuentoRetail = i;
      return [i.grupoId, i];
    })
  );

  var descuentoCliente = cliente.descuentos[producto.id];
  var descuento = 0;
  var precio = 0;
  var precioFinal;

  if (descuentoCliente != null) {
    producto.descuentos.push({ name: "Cliente", descuento: descuentoCliente.descuento || 0 });
    producto.precios.push({ name: "Cliente", precio: descuentoCliente.precio || 1 });
    precio = descuentoCliente.precio;
    descuento = descuentoCliente.descuento || 0;
  } else {
    clienteGrupos.forEach(clienteGrupo => {
      var descuentoForGrupo = descuentosMap.get(clienteGrupo.grupoId);
      var precioForGrupo = preciosMap.get(clienteGrupo.grupoId);

      if (descuentoForGrupo && precioForGrupo) {
        var precioFinalGrupo = precioForGrupo.precio * (1 - descuentoForGrupo.descuento / 100);
        if (!precioFinal) {
          precioFinal = precioFinalGrupo;
          precio = precioForGrupo.precio;
          descuento = descuentoForGrupo.descuento;
        } else if (precioFinalGrupo < precioFinal) {
          precioFinal = precioFinalGrupo;
          precio = precioForGrupo.precio;
          descuento = descuentoForGrupo.descuento;
        }
      }
    });
  }

  if (!precio || precio == 0) {
    var descuentoForGrupo = descuentoRetail || { name: "Sin Definir", descuento: 0 };
    var precioForGrupo = precioRetail;
    if (!precioForGrupo) throw new Error("Este producto no tiene precio retail o grupos asignados.");
    var precioFinalGrupo = precioForGrupo.precio * (1 - descuentoForGrupo.descuento / 100);
    precioFinal = precioFinalGrupo;
    precio = precioForGrupo.precio;
    descuento = descuentoForGrupo.descuento;
  }

  if (!descuento || descuento == 0) descuento = 0;

  return {
    impuestoUnitario: producto.impuesto,
    _impuestoUnitario: producto.impuesto,
    precio: precio,
    precios: precios,
    descuentos: descuentos,
    descuentoUnitario: descuento
  };
};

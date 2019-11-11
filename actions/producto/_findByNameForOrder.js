var QueryAction = require("../../operation/baseQueryAction");
var Errors = require("../../errors");
var moment = require("moment-timezone");

module.exports = class PagoCreateAction extends QueryAction {

  async query(body) {

    var cliente = await this.knex("cliente").select(["cliente.*", "grupo.name as __grupoId"])
      .leftJoin("grupo", "cliente.grupoId", "grupo.id")
      .where({ "cliente.id": body.clienteId })
      .first();

    var productos = await this.getOperation("producto").query({ filters: [["producto.activo", "=", 1]], fields: ["id", "name", "inventario", "impuesto", "unidadMedida", "codigo", "mercancia"] })
    var productosMap = {};
    productos.forEach((producto) => {
      producto.precios = [];
      producto.descuentos = [];
      productosMap[producto.id] = producto;
    })

    var descuentosClientes = await this.knex("descuentoCliente").select().where({ clienteId: cliente.id });
    var mapDescuentosCliente = {};
    descuentosClientes.forEach((descuento) => {
      mapDescuentosCliente[descuento.productoId] = { name: "Cliente", descuento: descuento.descuento };
    })

    var descuentoGrupo = await this.knex("descuentoGrupo")
      .select(["grupo.name as name", "descuento"])
      .innerJoin("grupo", "descuentoGrupo.grupoId", "grupo.id")
      .where({ "descuentoGrupo.grupoId": cliente.grupoId }).first();
    descuentoGrupo = descuentoGrupo || { name: "Sin Descuento", descuento: 0 };

    var descuentosPromocion = await this.knex("descuentoPromocion")
      .select(["promocion.name as name", "descuento", "productoId"])
      .innerJoin("promocion", "descuentoPromocion.promocionId", "promocion.id")
      .where("promocion.fechaVencimiento", "<=", moment().format("YYYY-MM-DD"));

    var mapDescuentosPromocion = {};
    descuentosPromocion.forEach((descuento) => {
      mapDescuentosPromocion[descuento.productoId] = descuento;
    })

    var precios = await this.knex("precio").select("*");
    precios.forEach((precio) => {
      if (productosMap[precio.productoId]) {
        productosMap[precio.productoId].precios.push({ name: precio.name, precio: precio.precio });

        if (precio.name == cliente.__grupoId) productosMap[precio.productoId].precio = precio.precio;
        else if (precio.name == "retail") productosMap[precio.productoId].precio = precio.precio;
      }
    })

    productos.forEach((producto) => {
      producto.descuento = 0;

      producto.descuento = descuentoGrupo.descuento;
      producto.descuentos.push(descuentoGrupo);

      if (mapDescuentosCliente[producto.id]) {
        var descuento = mapDescuentosCliente[producto.id];
        if (descuento.descuento > producto.descuento) producto.descuento = descuento.descuento;
        producto.descuentos.push(descuento);
      }


      if (mapDescuentosPromocion[producto.id]) {
        var descuento = mapDescuentosPromocion[producto.id];
        if (descuento.descuento > producto.descuento) producto.descuento = descuento.descuento;
        producto.descuentos.push(descuento);
      }

    })

    return productos;

  }

}

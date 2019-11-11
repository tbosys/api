var QueryAction = require("../../operation/baseQueryAction");

var cacheByName = {};

module.exports = class PagoCreateAction extends QueryAction {
  get secure() {
    return false;
  }
  async query(body) {
    //if (cacheByName[`${this.user.account}_${body.name}`])
    //return cacheByName[`${this.user.account}_${body.name}`];

    var queryResponse = this.knex
      .table("producto")
      .select(
        "producto.id",
        "producto.name",
        "producto.inventario",
        "producto.impuesto",
        "producto.impuestoCodigoTarifa",
        "producto.presentacion",
        "producto.subFamilia",
        "producto.familia",
        "producto.unidadMedida",
        "producto.codigo",
        "producto.mercancia",
        "precio.name as precioName",
        "precio.grupoId as precioGrupoId",
        "precio.precio as productoPrecio",
        "descuentoGrupo.name as descuentoName",
        "descuentoGrupo.descuento as productoDescuento",
        "descuentoGrupo.grupoId as descuentoGrupoId"
      )
      .leftJoin("precio", "precio.productoId", "producto.id")
      .leftJoin("descuentoGrupo", "descuentoGrupo.productoId", "producto.id")
      .where("producto.activo", 1);

    if (body.name) {
      var parts = body.name.split(" ");
      var index = parts.length - 1;
      while (index > -1) {
        queryResponse = queryResponse.where("producto.name", "like", `%${parts[index]}%`);
        index--;
      }
    }

    if (body.ids) {
      queryResponse = queryResponse.whereIn("producto.id", body.ids);
    }

    var productos = await queryResponse;
    var productoMap = {};
    productos.forEach(productoLine => {
      var producto = productoMap[productoLine.id];

      if (!producto)
        producto = {
          id: productoLine.id,
          familia: productoLine.familia,
          presentacion: productoLine.presentacion,
          subFamilia: productoLine.subFamilia,
          name: productoLine.name,
          inventario: productoLine.inventario,
          impuesto: productoLine.impuesto,
          unidadMedida: productoLine.unidadMedida,
          codigo: productoLine.codigo,
          mercancia: productoLine.mercancia,
          precios: {}
        };

      var precioKey = productoLine.precioGrupoId;
      var oldPrecio = producto.precios[precioKey] || {};

      if (productoLine.precioGrupoId && productoLine.productoPrecio != null) {
        producto.precios[precioKey] = {
          grupoId: productoLine.precioGrupoId,
          name: productoLine.precioName,
          precio: productoLine.productoPrecio,
          descuento: oldPrecio.descuento || 0
        };
      }

      precioKey = productoLine.descuentoGrupoId;
      oldPrecio = producto.precios[precioKey] || {};
      if (productoLine.descuentoGrupoId && productoLine.productoDescuento != null) {
        producto.precios[precioKey] = {
          name: productoLine.descuentoName,
          grupoId: productoLine.descuentoGrupoId,
          descuento: productoLine.productoDescuento,
          precio: oldPrecio.precio || 0
        };
      }
      productoMap[producto.id] = producto;
      /*
      if (
        productoLine.descuentoPromocionName &&
        !producto.descuentosMap[`promocion_${productoLine.descuentoPromocionName}`]
      ) {
        producto.descuentos.push({
          name: productoLine.descuentoPromocionName,
          descuento: productoLine.descuentoPromocionDescuento
        });
        producto.descuentosMap[`promocion_${productoLine.descuentoPromocionName}`] = true;
      }
      */
    });

    var results = Object.values(productoMap);
    //cacheByName[`${this.user.account}_${body.name}`] = results;

    if (body.name) results.slice(0, 13);
    return results;
  }
};

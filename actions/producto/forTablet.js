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
        "producto.categoriaName",
        "producto.grupo",
        "producto.marca",
        "producto.atributoSubCategoria",
        "producto.atributoGeneral",
        "producto.atributoPrincipal",
        "producto.unidadMedida",
        "producto.codigo",
        "producto.mercancia",
        "precio.name as precioName",
        "precio.grupoId as precioGrupoId",
        "precio.precio as productoPrecio",
        "descuentoGrupo.name as descuentoGrupoName",
        "descuentoGrupo.descuento as descuentoGrupoDescuento",
        "descuentoGrupo.grupoId as descuentoGrupoId"
        //  "promocion.name as descuentoPromocionName",
        // "descuentoPromocion.descuento as descuentoPromocionDescuento"
      )

      .leftJoin("precio", "precio.productoId", "producto.id")
      .leftJoin("descuentoGrupo", "descuentoGrupo.productoId", "producto.id")
      //.leftJoin("grupo", "descuentoGrupo.grupoId", "grupo.id")
      // .leftJoin("descuentoPromocion", "descuentoPromocion.productoId", "producto.id")
      // .leftJoin("promocion", "descuentoPromocion.promocionId", "promocion.id")
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
          grupo: productoLine.grupo,
          presentacion: productoLine.presentacion,
          marca: productoLine.marca,
          atributoSubCategoria: productoLine.atributoSubCategoria,
          atributoGeneral: productoLine.atributoGeneral,
          atributoPrincipal: productoLine.atributoPrincipal,
          categoriaName: productoLine.categoriaName,
          name: productoLine.name,
          inventario: productoLine.inventario,
          impuesto: productoLine.impuesto,
          unidadMedida: productoLine.unidadMedida,
          codigo: productoLine.codigo,
          mercancia: productoLine.mercancia,
          precios: [],
          precioMap: {},
          descuentos: [],
          descuentosMap: {}
        };

      if (productoLine.precioGrupoId && !producto.precioMap[productoLine.precioGrupoId]) {
        producto.precioMap[productoLine.precioGrupoId] = true;
        producto.precios.push({
          grupoId: productoLine.precioGrupoId,
          name: productoLine.precioName,
          precio: productoLine.productoPrecio
        });
      }

      if (
        productoLine.descuentoGrupoId &&
        !producto.descuentosMap[`grupo_${productoLine.descuentoGrupoId}`]
      ) {
        producto.descuentos.push({
          name: productoLine.descuentoGrupoName,
          grupoId: productoLine.descuentoGrupoId,
          descuento: productoLine.descuentoGrupoDescuento
        });
        producto.descuentosMap[`grupo_${productoLine.descuentoGrupoId}`] = true;
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

    var keys = Object.keys(productoMap);
    var results = keys.map(key => {
      delete productoMap[key].descuentosMap;
      delete productoMap[key].precioMap;
      return productoMap[key];
    });
    cacheByName[`${this.user.account}_${body.name}`] = results;

    if (body.name) results.slice(0, 13);
    return results;
  }
};

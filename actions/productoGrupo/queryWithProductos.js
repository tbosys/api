var QueryAction = require("../../operation/baseQueryAction");
var Errors = require("../../errors");
var moment = require("moment-timezone");

module.exports = class queryWithProductos extends QueryAction {
  get secure() {
    return false;
  }

  async query(body) {
    var descuentoVolumen = await this.knex
      .table("productoDescuentoVolumen")
      .select()
      .where("estado", "aprobado");

    var descuentoVolumenMap = {};
    descuentoVolumen.forEach(descuento => {
      if (!descuentoVolumenMap[descuento.productoId]) descuentoVolumenMap[descuento.productoId] = [];
      descuentoVolumenMap[descuento.productoId].push({
        descuento: descuento.descuento,
        cantidadMinima: descuento.cantidadMinima,
        cantidadMaxima: descuento.cantidadMaxima
      });
    });

    var grupos = await this.knex
      .table(this.table)
      .select([
        "productoGrupo.productoCategoriaId",
        "productoGrupo.tipos as tipos",
        "productoCategoria.productoDepartamentoId",
        "productoCategoria.name as productoCategoriaName",
        "productoCategoria.orden as productoCategoriaOrden",
        "productoDepartamento.id as productoDepartamentoId",
        "productoDepartamento.name as productoDepartamentoName",
        "productoDepartamento.orden as productoDepartamentoOrden",
        "productoGrupo.*"
      ])
      .innerJoin("productoCategoria", "productoCategoria.id", "productoGrupo.productoCategoriaId")
      .innerJoin(
        "productoDepartamento",
        "productoDepartamento.id",
        "productoCategoria.productoDepartamentoId"
      )
      .orderBy(["productoDepartamento.orden", "productoCategoria.orden"]);

    var grupoMap = grupos.reduce(function(map, obj) {
      map[obj.id] = obj;
      return map;
    }, {});

    grupoMap[-1] = {
      productoCategoriaId: -1,
      tipos: "",
      productoDepartamentoId: -1,
      productoCategoriaName: "Otros",
      productoCategoriaOrden: 1,
      productoDepartamentoName: "Otros",
      productoDepartamentoOrden: 1,
      name: "Otros",
      descripcion: "Autogenerado porque hay productos huerfanos",
      orden: 1,
      id: -1
    };

    var productos = await this.knex
      .table("producto")
      .select(
        "producto.id",
        "producto.name",
        "producto.inventario",
        "producto.impuesto",
        "producto.presentacion",
        "producto.marca",
        "producto.familia",
        "producto.subFamilia",
        "producto.unidadMedida",
        "producto.atributoPrincipal",
        "producto.codigo",
        "producto.mercancia",
        "precio.name as precioName",
        "precio.grupoId as precioGrupoId",
        "precio.precio as productoPrecio",
        "descuentoGrupo.name as descuentoName",
        "descuentoGrupo.descuento as grupoDescuento",
        "descuentoGrupo.grupoId as descuentoGrupoId"
      )
      .leftJoin("precio", "precio.productoId", "producto.id")
      .leftJoin("descuentoGrupo", "descuentoGrupo.productoId", "producto.id")
      .where("producto.activo", 1);

    //.where("producto.updatedAt", ">", body.lastUpdatedAt);

    var productoMap = productos.reduce(function(map, obj) {
      map[obj.id] = obj;
      return map;
    }, {});

    productos.forEach(producto => {
      var mappedProducto = productoMap[producto.id];
      if (!mappedProducto.precios) mappedProducto.precios = [];
      if (!mappedProducto.descuentos) mappedProducto.descuentos = [];
      if (!mappedProducto.volumenes) mappedProducto.volumenes = [];

      mappedProducto.volumenes = descuentoVolumenMap[producto.id] || [];

      if (
        mappedProducto.precios.filter(precio => {
          return producto.precioName === precio.name;
        }).length == 0
      )
        mappedProducto.precios.push({
          grupoId: producto.precioGrupoId,
          name: producto.precioName,
          precio: producto.productoPrecio
        });
      if (
        mappedProducto.descuentos.filter(descuento => {
          return producto.descuentoName === descuento.name;
        }).length == 0
      )
        mappedProducto.descuentos.push({
          grupoId: producto.descuentoGrupoId,
          name: producto.descuentoName,
          descuento: producto.grupoDescuento
        });
    });

    var productoGrupoLists = await this.knex.table("productoGrupoList").select();

    productoGrupoLists.forEach(productoGrupoList => {
      var grupo = grupoMap[productoGrupoList.productoGrupoId || -1];
      if (!grupo) return;
      if (!Array.isArray(grupo.productos)) grupo.productos = [];
      if (productoMap[productoGrupoList.productoId])
        grupo.productos.push(productoMap[productoGrupoList.productoId]);
    });
    grupos.push(grupoMap[-1]);
    return grupos.filter(grupo => grupo.productos);
  }
};

const Errors = require("../errors");
var Security = require("../apiHelpers/security");

var BaseOperation = require("../operation/baseOperation");
const moment = require("moment");

class ApiOperation extends BaseOperation {
  get table() {
    return "productoCatalog";
  }

  get multiTenantObject() {
    return true;
  }

  async singleUpdate(body) {
    await this.getActionAndInvoke("precio", "replace", {
      productoId: body.id,
      descuento: body.descuento,
      grupoId: body.grupoId,
      precio: body.precio
    });
    await this.getActionAndInvoke("descuentoGrupo", "replace", {
      productoId: body.id,
      descuento: body.descuento,
      grupoId: body.grupoId
    });
    return true;
  }

  async save(body) {
    var precios = body.ids.precios;
    var promises = [];
    precios.forEach(async precio => {
      precio.grupos.forEach(grupo => {
        var promisePrecio = this.getActionAndInvoke("precio", "replace", { ...grupo, productoId: precio.id });
        promises.push(promisePrecio);
        var promiseDescuento = this.getActionAndInvoke("descuentoGrupo", "replace", {
          ...grupo,
          productoId: precio.id
        });
        promises.push(promiseDescuento);
      });
    });

    return Promise.all(promises);
  }

  async getPriceList(id) {
    let productos = [];
    var query = this.knex
      .table("producto")
      .select(
        "producto.id",
        "producto.name",
        "producto.inventario",
        "producto.impuesto",
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
        "costoHistorico.costo as costo"
      )
      .where("producto.activo", 1)
      .leftJoin("costoHistorico", "costoHistorico.id", "producto.costoHistoricoId")
      .orderBy("name");

    if (id) productos = await query.where("producto.id", id);
    else productos = await query;

    var precios = await this.knex.table("precio").select("name", "productoId", "precio");
    var preciosMap = {};
    precios.forEach(precio => {
      preciosMap[precio.name + "__" + precio.productoId] = precio.precio;
    });

    var descuentos = await this.knex.table("descuentoGrupo").select("name", "productoId", "descuento");
    var descuentoMap = {};
    descuentos.forEach(descuento => {
      descuentoMap[descuento.name + "__" + descuento.productoId] = descuento.descuento;
    });

    var pricesList = [];
    var grupos = await this.knex.table("grupo").select();

    productos.forEach(producto => {
      var priceListItem = {
        id: producto.id,
        producto: producto.name,
        marca: producto.marca,
        grupo: producto.grupo,
        costo: producto.costo || 0.1
      };
      grupos.forEach(grupo => {
        var precio = preciosMap[grupo.name + "__" + producto.id];
        var descuento = descuentoMap[grupo.name + "__" + producto.id] || 0;

        if (precio == null) return null;

        priceListItem["_" + grupo.name] = {
          precio: precio,
          descuento: descuento,
          grupoId: grupo.id,
          costo: producto.costo
        };
        priceListItem[grupo.name] = precio;
      });
      pricesList.push(priceListItem);
    });

    return pricesList;
  }

  async query(body) {
    Security.checkQuery("priceList", this.user);

    var all = await this.getPriceList();
    return all.filter(item => {
      var include = false;
      if (!body.filters || body.filters.length == 0) return true;
      body.filters.forEach(filter => {
        var key = filter[0];
        var value = filter[2].replace("%", "").replace("%", "");
        if (key == "priceList.producto" && item.producto && item.producto.indexOf(value) > -1) include = true;
        if (
          key == "priceList.marca" &&
          item.marca &&
          item.marca.toLowerCase().indexOf(value.toLowerCase()) > -1
        )
          include = true;
        if (
          key == "priceList.grupo" &&
          item.grupo &&
          item.grupo.toLowerCase().indexOf(value.toLowerCase()) > -1
        )
          include = true;
      });
      return include;
    });
  }

  async update(body) {
    var result = await this.getPriceList(body.id);
    return result[0];
  }

  async metadata() {
    var metadata = this.getMetadata();
    Security.checkQuery("priceList", this.user);

    var pricesList = await this.getPriceList();
    var grupos = await this.knex.table("grupo").select();
    grupos.forEach(grupo => {
      metadata.properties[grupo.name] = {
        $id: "/properties/" + grupo.name,
        type: "string",
        formatter: "PrecioFormatter",
        width: 200,
        title: grupo.name
      };
      if (metadata.table.fields.indexOf(grupo.name) == -1) metadata.table.fields.push(grupo.name);
    });
    metadata.count = pricesList.length;
    metadata.user = this.user;
    metadata.item = null;
    metadata.recent = pricesList;
    return this.postMetadata(metadata);
  }

  async postQuery(items) {
    var keys;
    items.forEach(item => {
      if (!keys) keys = Object.keys(item);
      keys.forEach(key => {
        if (item[key] == null) delete item[key];
      });
      if (item.fechaIngreso) item.fechaIngreso = moment(item.fechaIngreso).format("YYYY-MM-DD");
    });

    return items;
  }
}

module.exports = ApiOperation;

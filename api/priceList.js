const Errors = require("../errors");
var Security = require("../apiHelpers/security");

var BaseOperation = require("../operation/baseOperation");
const moment = require("moment");

class ApiOperation extends BaseOperation {
  get table() {
    return "priceList";
  }

  get multiTenantObject() {
    return true;
  }

  async singleUpdate(body) {
    if (body.descuento < 0 || body.descuento > 100) throw new Errors.VALIDATION_ERROR("Descuento invalido!");
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
    var descuento = precios[0] ? precios[0].grupos[0].descuento : null;
    if (!descuento || descuento < 0 || descuento > 100) throw new Errors.VALIDATION_ERROR("Descuento invalido!");
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
        "producto.subFamilia",
        "producto.familia",
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

    let accessToCostos = false;
    try {
      Security.checkQuery("costoHistorico", this.user);
      accessToCostos = true;
    } catch (e) {}

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
      if (!accessToCostos) producto.costo = 0.1;
      var priceListItem = {
        id: producto.id,
        producto: producto.name,
        inventario: producto.inventario,
        familia: producto.familia,
        subFamilia: producto.subFamilia,
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
      var include = true;
      if (!body.filters || body.filters.length == 0) return true;
      body.filters.forEach(filter => {
        var key = filter[0];
        var value = filter[2]
          .replace("%", "")
          .replace("%", "")
          .toLowerCase();
        if (key == "priceList.producto" && item.producto && item.producto.toLowerCase().indexOf(value) == -1)
          include = false;
        if (
          key == "priceList.familia" &&
          item.familia &&
          item.familia.toLowerCase().indexOf(value.toLowerCase()) == -1
        )
          include = false;
        if (
          key == "priceList.subFamilia" &&
          item.subFamilia &&
          item.subFamilia.toLowerCase().indexOf(value.toLowerCase()) == -1
        )
          include = false;
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
    grupos.sort((a, b) => {
      if (!a.orden) a.orden = 1000;
      if (!b.orden) b.orden = 1000;
      a.orden = parseInt(a.orden);
      b.orden = parseInt(b.orden);

      if (a.orden > b.orden) return 1;
      if (b.orden > a.orden) return -1;
      return 0;
    });
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

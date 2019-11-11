var QueryAction = require("../../operation/baseQueryAction");

module.exports = class RegistroRecentQuery extends QueryAction {
  get secure() {
    return false;
  }
  async query(body) {
    var defaultGrupo = this.knex("grupo")
      .select()
      .where("name", "retail")
      .first();

    var clientePromise = this.knex("cliente")
      .select([
        "zona.name as zona",
        "cliente.*",
        "clienteStats.ultimaCompra",
        "clienteStats.promedioPagoDias",
        "clienteStats.promedioCompra",
        "clienteStats.totalCiclo",
        "clienteStats.coberturaCompra",
        "clienteStats.totalCicloUnidadG1",
        "clienteStats.totalCicloG1",
        "clienteStats.promedioCompraG1",
        "clienteStats.coberturaCompraG1",
        "clienteStats.coberturaCompraGs",
        "clienteStats.saldo",
        "descuentoCliente.productoId as descuentoClienteProductoId",
        "descuentoCliente.descuento as descuentoClienteDescuento",
        "descuentoCliente.precio as descuentoClientePrecio",
        "transporte.name as __transporteId"
      ])
      .leftJoin("zona", "zona.id", "cliente.zonaId")
      .leftJoin("transporte", "transporte.id", "cliente.transporteId")
      .leftJoin("descuentoCliente", "descuentoCliente.clienteId", "cliente.id")
      .leftJoin("clienteStats", "clienteStats.clienteId", "cliente.id");

    var productos = [];

    if (body.id) {
      clientePromise = clientePromise.where("cliente.id", body.id);
      var productosFromMovimientos = await this.knex
        .table("movimientoInventario")
        .select("detalle as name")
        .select("productoId")
        .count("detalle as count")
        .where("clienteId", body.id)
        .where("tipo", "FA")
        .where("createdAt", ">=", this.knex.raw("now()-interval 3 month"))
        .groupBy("detalle", "id")
        .orderBy("count");

      productos = await this.getActionAndInvoke(
        "producto",
        "forTablet",
        {
          ids: productosFromMovimientos.map(movimiento => movimiento.productoId)
        },
        true
      );
    } else {
      if (this.user.nivel > 4) clientePromise = clientePromise.where("cliente.ownerId", this.user.id);
      else
        clientePromise = clientePromise.where("cliente.creditoPlazo", ">", 0).where("cliente.activo", true);
    }
    clientePromise = clientePromise.orderBy("cliente.name", "ASC");

    var clientes = await clientePromise;

    var grupos = await this.knex
      .table("clienteGrupo")
      .select(["clienteGrupo.clienteId", "clienteGrupo.grupoId", "grupo.name", "grupo.orden"])
      .innerJoin("grupo", "grupo.id", "clienteGrupo.grupoId");

    var grupoMap = {};
    grupos.forEach(grupo => {
      var list = grupoMap[grupo.clienteId] || [];
      list.push(grupo);
      grupoMap[grupo.clienteId] = list;
    });

    var clientesMap = {};
    clientes.forEach(clienteLine => {
      var cliente = clientesMap[clienteLine.id];

      if (!cliente)
        cliente = {
          ultimaCompra: clienteLine.ultimaCompra,
          promedioPagoDias: clienteLine.promedioPagoDias,
          promedioCompra: clienteLine.promedioCompra,
          totalCiclo: clienteLine.totalCiclo,
          coberturaCompra: clienteLine.coberturaCompra,
          totalCicloUnidadG1: clienteLine.totalCicloUnidadG1,
          totalCicloG1: clienteLine.totalCicloG1,
          promedioCompraG1: clienteLine.promedioCompraG1,
          coberturaCompraG1: clienteLine.coberturaCompraG1,
          coberturaCompraGs: clienteLine.coberturaCompraGs,
          saldo: clienteLine.saldo,

          ownerId: clienteLine.ownerId,
          updatedAt: clienteLine.updatedAt,
          productos: productos.slice(0, 10).reverse(),
          grupos: grupoMap[clienteLine.id] || [],
          id: clienteLine.id,
          name: clienteLine.name,
          zona: clienteLine.zona,
          grupo: clienteLine.grupo,
          grupoId: clienteLine.grupoId || defaultGrupo.id,
          vendedorId: clienteLine.vendedorId,
          __vendedorId: clienteLine.__vendedorId,
          creditoPlazo: clienteLine.creditoPlazo,
          creditoLimite: clienteLine.creditoPlazo,
          cedula: clienteLine.cedula,
          correoDocumentosElectronicos: clienteLine.correoDocumentosElectronicos,
          descuentos: {},
          transporteId: clienteLine.transporteId
        };

      if (clienteLine.descuentoClienteDescuento) {
        cliente.descuentos[clienteLine.descuentoClienteProductoId] = {
          descuento: clienteLine.descuentoClienteDescuento,
          precio: clienteLine.descuentoClientePrecio
        };
      }

      clientesMap[clienteLine.id] = cliente;
    });

    var clientesArray = Object.keys(clientesMap).map(key => clientesMap[key]);

    clientesArray.sort((a, b) => {
      if (a.name[0] > b.name[0]) return 1;
      else if (a.name[0] < b.name[0]) return -1;
      return 0;
    });

    return clientesArray;
  }
};

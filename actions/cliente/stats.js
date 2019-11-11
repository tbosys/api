var QueryAction = require("../../operation/baseQueryAction");
var moment = require("moment-timezone");

module.exports = class RegistroRecentQuery extends QueryAction {
  get secure() {
    return false;
  }

  async promedioStatSaldo() {
    var saldos = await this.knex("saldo")
      .select("clienteId")
      .select(this.knex.raw("max(DATEDIFF(NOW(),saldo.fecha)) as plazo"))
      .where("tipo", "FA")
      .groupBy("clienteId");
  }

  async promedioStatVenta() {
    var w1 = moment()
      .startOf("week")
      .add(-4, "week")
      .format("YYYY-MM-DD");

    var w2 = moment()
      .startOf("week")
      .add(-8, "week")
      .format("YYYY-MM-DD");

    var w3 = moment()
      .startOf("week")
      .add(-12, "week")
      .format("YYYY-MM-DD");

    var w4 = moment()
      .startOf("week")
      .add(-16, "week")
      .format("YYYY-MM-DD");

    var documentosPorMes = this.knex.raw(
      ` SELECT clienteId as clienteId, '1' AS week,sum(totalVentaNeta) AS totalConDescuento 
    FROM documento
    WHERE fecha >= "${w1}"
      AND fecha <= CURDATE() group by clienteId
  UNION ALL
    SELECT clienteId as clienteId,'2' AS week, sum(totalVentaNeta) AS totalConDescuento 
    FROM documento 
    WHERE fecha >= "${w2}"
      AND fecha < "${w1}"
      group by clienteId
      UNION ALL
    SELECT clienteId as clienteId,'3' AS week, sum(totalVentaNeta) AS totalConDescuento 
    FROM documento 
    WHERE fecha >= "${w3}"
      AND fecha < "${w2}" group by clienteId
      UNION ALL
    SELECT clienteId as clienteId,'3' AS week, sum(totalVentaNeta) AS totalConDescuento 
    FROM documento 
    WHERE fecha >= "${w4}"
      AND fecha < "${w3}" group by clienteId;`
    );

    documentosPorMes = await documentosPorMes;

    var promedioByClientes = {};
    documentosPorMes[0].forEach(item => {
      var promedioByCliente = promedioByClientes[item.clienteId] || 0;
      promedioByCliente += item.totalConDescuento || 0;
      promedioByClientes[item.clienteId] = promedioByCliente;
    });

    Object.keys(promedioByClientes).forEach(key => {
      promedioByClientes[key] = parseInt((promedioByClientes[key] / 3) * 100) / 100;
    });

    return promedioByClientes;
  }

  async promedioStatPago() {
    var pagosPorMes = this.knex("lineaPagoDocumento")
      .select("documentoId", "clienteId")
      .select(this.knex.raw("max(DATEDIFF(lineaPagoDocumento.fecha,documento.fecha)) as plazo"))
      .innerJoin("documento", "documento.id", "lineaPagoDocumento.documentoId")
      .where(
        "lineaPagoDocumento.fecha",
        ">",
        moment()
          .add("-90", "days")
          .format("YYYY-MM-DD")
      )
      .where("documento.tipo", "FA")
      .where("lineaPagoDocumento.plazoDocumento", ">", 0)
      .whereNull("documento.documentoAnuladorId")
      .groupBy("documentoId", "clienteId");

    pagosPorMes = await pagosPorMes;

    var pagosPorCliente = {};
    pagosPorMes.forEach(pago => {
      if (!pagosPorCliente[pago.clienteId]) pagosPorCliente[pago.clienteId] = [];
      pagosPorCliente[pago.clienteId].push(pago.plazo);
    });

    var pagoPromedioPorCliente = {};

    Object.keys(pagosPorCliente).forEach(key => {
      var pagos = pagosPorCliente[key] || [];
      var total = 0;
      pagos.forEach(monto => (total += monto));
      pagoPromedioPorCliente[key] = parseInt((total / pagos.length) * 100) / 100;
    });
  }

  async query(body) {
    var clientes = await this.knex("cliente")
      .select("*")
      .where("activo", true);

    var date = moment()
      .add(-300, "days")
      .format("YYYY-MM-DD");

    var saldos = await this.knex("saldo")
      .select("clienteId")
      .select(this.knex.raw("max(DATEDIFF(NOW(),saldo.fecha)) as plazo"))
      .where("tipo", "FA")
      .groupBy("clienteId");

    var pagosPorMes = this.knex("lineaPagoDocumento")
      .select("documentoId", "clienteId")
      .select(this.knex.raw("max(DATEDIFF(lineaPagoDocumento.fecha,documento.fecha)) as plazo"))
      .innerJoin("documento", "documento.id", "lineaPagoDocumento.documentoId")
      .where(
        "lineaPagoDocumento.fecha",
        ">",
        moment()
          .add("-90", "days")
          .format("YYYY-MM-DD")
      )
      .where("documento.tipo", "FA")
      .where("lineaPagoDocumento.plazoDocumento", ">", 0)
      .whereNull("documento.documentoAnuladorId")
      .groupBy("documentoId", "clienteId");

    console.log(pagosPorMes.toString());

    pagosPorMes = await pagosPorMes;

    var pagosPorCliente = {};
    pagosPorMes.forEach(pago => {
      if (!pagosPorCliente[pago.clienteId]) pagosPorCliente[pago.clienteId] = [];
      pagosPorCliente[pago.clienteId].push(pago.plazo);
    });

    var pagoPromedioPorCliente = {};

    Object.keys(pagosPorCliente).forEach(key => {
      var pagos = pagosPorCliente[key] || [];
      var total = 0;
      pagos.forEach(monto => (total += monto));
      pagoPromedioPorCliente[key] = parseInt((total / pagos.length) * 100) / 100;
    });

    var ultimasComprasArray = await this.knex("documento")
      .select("clienteId")
      .max("fecha as fecha")
      .where("tipo", "FA")
      .where(
        "fecha",
        ">",
        moment()
          .add(-12, "months")
          .format("YYYY-MM-DD")
      )
      .groupBy("clienteId");

    var ultimasCompras = {};
    ultimasComprasArray.forEach(compra => {
      ultimasCompras[compra.clienteId] = compra.fecha;
    });

    var w1 = moment()
      .startOf("week")
      .add(-4, "week")
      .format("YYYY-MM-DD");

    var w2 = moment()
      .startOf("week")
      .add(-8, "week")
      .format("YYYY-MM-DD");

    var w3 = moment()
      .startOf("week")
      .add(-12, "week")
      .format("YYYY-MM-DD");

    var w4 = moment()
      .startOf("week")
      .add(-12, "week")
      .format("YYYY-MM-DD");

    var documentosPorMes = this.knex.raw(
      ` SELECT clienteId as clienteId, '1' AS week,sum(subTotalConDescuento) AS totalConDescuento,sum(movimientoInventario.cantidad) as cantidad, producto.grupoProductoId  as grupoProductoId
      FROM movimientoInventario
      inner join producto on producto.id = movimientoInventario.productoId
      WHERE fecha >= "${w1}"
        AND fecha <= CURDATE() 
        AND movimientoInventario.tipo IN ("FA","NC","ND")
        group by clienteId,producto.grupoProductoId
    UNION ALL
      SELECT clienteId as clienteId,'2' AS week, sum(subTotalConDescuento) AS totalConDescuento,sum(movimientoInventario.cantidad) as cantidad,producto.grupoProductoId  as grupoProductoId
      FROM movimientoInventario
      inner join producto on producto.id = movimientoInventario.productoId
      WHERE fecha >= "${w2}"
        AND fecha < "${w1}"
        AND movimientoInventario.tipo IN ("FA","NC","ND")
        group by clienteId,producto.grupoProductoId
        UNION ALL
      SELECT clienteId as clienteId,'3' AS week, sum(subTotalConDescuento) AS totalConDescuento ,sum(movimientoInventario.cantidad) as cantidad,producto.grupoProductoId as grupoProductoId
      FROM movimientoInventario
      inner join producto on producto.id = movimientoInventario.productoId
      AND movimientoInventario.tipo IN ("FA","NC","ND")
      WHERE fecha >= "${w3}"
        AND fecha < "${w2}" group by clienteId,producto.grupoProductoId`
    );

    var documentosPorMesResults = await documentosPorMes;

    var promedioByClientes = {};
    var ventasCicloByClientes = {};
    var sumByClientesGrupoCurrent = {};
    var promedioByClientesGrupo = {};
    var promedioByClienteOldest = {};
    var promedioByClienteGroupOldest = {};
    documentosPorMesResults[0].forEach((item, index) => {
      if (item.week == "1") {
        var ventaByClienteCurrent = ventasCicloByClientes[item.clienteId] || 0;
        ventaByClienteCurrent += item.totalConDescuento;

        var promedioByClienteCurrent = sumByClientesGrupoCurrent[item.clienteId];
        if (!promedioByClienteCurrent)
          promedioByClienteCurrent = {
            grupos: {},
            total: 0
          };
        promedioByClienteCurrent.total += item.totalConDescuento;
        if (!promedioByClienteCurrent.grupos[item.grupoProductoId])
          promedioByClienteCurrent.grupos[item.grupoProductoId] = { total: 0, cantidad: 0 };

        ventasCicloByClientes[item.clienteId] = ventaByClienteCurrent;
        promedioByClienteCurrent.grupos[item.grupoProductoId].total += item.totalConDescuento || 0;
        promedioByClienteCurrent.grupos[item.grupoProductoId].cantidad += item.cantidad || 0;
        sumByClientesGrupoCurrent[item.clienteId] = promedioByClienteCurrent;
      }

      if (item.week == "3") {
        if (!promedioByClienteOldest[item.clienteId]) promedioByClienteOldest[item.clienteId] = 0;
        if (!promedioByClienteGroupOldest[item.clienteId + "_" + item.grupoProductoId])
          promedioByClienteGroupOldest[item.clienteId + "_" + item.grupoProductoId] = 0;

        promedioByClienteGroupOldest[item.clienteId + "_" + item.grupoProductoId] += item.totalConDescuento;
        promedioByClienteOldest[item.clienteId] += item.totalConDescuento;
      }

      var promedioByCliente = promedioByClientes[item.clienteId] || 0;

      var promedioByClienteGrupo = promedioByClientesGrupo[item.clienteId + "_" + item.grupoProductoId] || 0;
      promedioByCliente += item.totalConDescuento || 0;
      promedioByClienteGrupo += item.totalConDescuento;
      promedioByClientes[item.clienteId] = promedioByCliente;
      promedioByClientesGrupo[item.clienteId + "_" + item.grupoProductoId] = promedioByClienteGrupo;
    });

    Object.keys(promedioByClientes).forEach(key => {
      var months = promedioByClienteOldest[key] > 0 ? 3 : 2;
      promedioByClientes[key] = parseInt((promedioByClientes[key] / months) * 100) / 100;
    });

    Object.keys(promedioByClientesGrupo).forEach(key => {
      var months = promedioByClienteGroupOldest[key] > 0 ? 3 : 2;
      promedioByClientesGrupo[key] = parseInt((promedioByClientesGrupo[key] / months) * 100) / 100;
    });
    var clienteMap = new Map(clientes.map(i => [i.id, i]));

    saldos.forEach(saldo => {
      var cliente = clienteMap.get(saldo.clienteId);
      if (cliente) cliente.plazoMaximo = saldo.plazo;
    });

    var saldosTotal = await this.knex("saldo")
      .select("clienteId")
      .select(this.knex.raw("sum(total) as total"))
      .groupBy("clienteId");

    var saldosByCliente = {};
    saldosTotal.map(saldo => {
      saldosByCliente[saldo.clienteId] = saldo.total;
    });

    await this.knex.table("clienteStats").delete();

    var promises = [];
    clienteMap.forEach(cliente => {
      var promedioCompra = promedioByClientes[cliente.id] || 0;
      var promedioCompraG1 = promedioByClientesGrupo[cliente.id + "_1"] || 0;
      var promedioCompraG2 = promedioByClientesGrupo[cliente.id + "_2"] || 0;
      var promedioCompraG3 = promedioByClientesGrupo[cliente.id + "_3"] || 0;
      var promedioCompraG4 = promedioByClientesGrupo[cliente.id + "_4"] || 0;
      var promedioCompraG5 = promedioByClientesGrupo[cliente.id + "_5"] || 0;

      var clienteGrupos = sumByClientesGrupoCurrent[cliente.id] || {
        grupos: { 1: {}, 2: {}, 3: {}, 4: {}, 5: {} },
        total: 0
      };

      var cantidadG1 = clienteGrupos.grupos[1] ? clienteGrupos.grupos[1].cantidad || 0 : 0;
      var cantidadG2 = clienteGrupos.grupos[2] ? clienteGrupos.grupos[2].cantidad || 0 : 0;
      var cantidadG3 = clienteGrupos.grupos[3] ? clienteGrupos.grupos[3].cantidad || 0 : 0;
      var cantidadG4 = clienteGrupos.grupos[4] ? clienteGrupos.grupos[4].cantidad || 0 : 0;
      var cantidadG5 = clienteGrupos.grupos[5] ? clienteGrupos.grupos[5].cantidad || 0 : 0;

      var totalG1 = clienteGrupos.grupos[1] ? clienteGrupos.grupos[1].total || 0 : 0;
      var totalG2 = clienteGrupos.grupos[2] ? clienteGrupos.grupos[2].total || 0 : 0;
      var totalG3 = clienteGrupos.grupos[3] ? clienteGrupos.grupos[3].total || 0 : 0;
      var totalG4 = clienteGrupos.grupos[4] ? clienteGrupos.grupos[4].total || 0 : 0;
      var totalG5 = clienteGrupos.grupos[5] ? clienteGrupos.grupos[5].total || 0 : 0;

      var plazoPago = pagoPromedioPorCliente[cliente.id] || 0;
      var ultimaCompra = ultimasCompras[cliente.id] || null;

      var coberturaCompraG1 =
        promedioCompraG1 > 0 && clienteGrupos.grupos[1]
          ? ((clienteGrupos.grupos[1].total || 0) / promedioCompraG1) * 100
          : null;
      var coberturaCompraG2 =
        promedioCompraG2 > 0 && clienteGrupos.grupos[2]
          ? ((clienteGrupos.grupos[2].total || 0) / promedioCompraG2) * 100
          : null;
      var coberturaCompraG3 =
        promedioCompraG3 > 0 && clienteGrupos.grupos[3]
          ? ((clienteGrupos.grupos[3].total || 0) / promedioCompraG3) * 100
          : null;
      var coberturaCompraG4 =
        promedioCompraG4 > 0 && clienteGrupos.grupos[4]
          ? ((clienteGrupos.grupos[4].total || 0) / promedioCompraG4) * 100
          : null;
      var coberturaCompraG5 =
        promedioCompraG4 > 0 && clienteGrupos.grupos[4]
          ? ((clienteGrupos.grupos[4].total || 0) / promedioCompraG4) * 100
          : null;

      var coberturaCompra = promedioCompra > 0 ? (clienteGrupos.total / promedioCompra) * 100 : 0;

      var coberturaCompraGs =
        ([coberturaCompraG1, coberturaCompraG2, coberturaCompraG3, coberturaCompraG4].filter(
          item => item != null
        ).length /
          4) *
        100;

      var saldoCliente = saldosByCliente[cliente.id] || 0;

      if (cliente.segmentoId != 1)
        promises.push(
          this.knex.table("clienteStats").insert({
            clienteId: cliente.id,
            name: cliente.name,
            clienteGrupoComercialId: cliente.clienteGrupoComercialId,
            saldo: saldoCliente,
            coberturaCreditoMonto:
              cliente.creditoLimite > 0 ? (saldoCliente / cliente.creditoLimite) * 100 : null,
            coberturaCreditoDias:
              cliente.creditoPlazo > 0 ? (plazoPago / (cliente.creditoPlazo + 15)) * 100 : null,
            ultimaCompra: ultimaCompra,
            ultimoContacto: ultimasCompras[cliente.id],
            zonaId: cliente.zonaId,
            distritoId: cliente.distritoId,
            creditoPlazo: cliente.creditoPlazo,
            creditoLimite: cliente.creditoLimite,
            tags: cliente.tags,
            segmentoId: cliente.segmentoId,
            ownerId: cliente.ownerId,
            totalCicloUnidadG1: cantidadG1,
            totalCicloUnidadG2: cantidadG2,
            totalCicloUnidadG3: cantidadG3,
            totalCicloUnidadG4: cantidadG4,
            totalCicloUnidadG5: cantidadG5,
            totalCiclo: ventasCicloByClientes[cliente.id] || 0,
            totalCicloG1: totalG1,
            totalCicloG2: totalG2,
            totalCicloG3: totalG3,
            totalCicloG4: totalG4,
            totalCicloG5: totalG5,

            promedioPagoDias: pagoPromedioPorCliente[cliente.id] || 0,
            promedioCompra: promedioCompra,
            promedioCompraG1: promedioCompraG1,
            promedioCompraG2: promedioCompraG2,
            promedioCompraG3: promedioCompraG3,
            promedioCompraG4: promedioCompraG4,
            promedioCompraG5: promedioCompraG5,
            coberturaCompraGs: coberturaCompraGs,
            coberturaCompra: coberturaCompra > 100 ? 100 : coberturaCompra,
            coberturaCompraG1: coberturaCompraG1 > 100 ? 100 : coberturaCompraG1 < 0 ? 0 : coberturaCompraG1,
            coberturaCompraG2: coberturaCompraG2 > 100 ? 100 : coberturaCompraG2 < 0 ? 0 : coberturaCompraG2,
            coberturaCompraG3: coberturaCompraG3 > 100 ? 100 : coberturaCompraG3 < 0 ? 0 : coberturaCompraG3,
            coberturaCompraG4: coberturaCompraG4 > 100 ? 100 : coberturaCompraG4 < 0 ? 0 : coberturaCompraG4,
            coberturaCompraG5: coberturaCompraG5 > 100 ? 100 : coberturaCompraG5 < 0 ? 0 : coberturaCompraG5,
            fecha: moment().format("YYYY-MM-DD"),
            "YYYY-MM": moment().format("YYYY-MM")
          })
        );
    });

    return Promise.all(promises);
  }

  getNivel6013FromCantidad(cantidad) {
    if (cantidad == 0) return 0;
    else if (cantidad < 60) return 20;
    else if (cantidad < 120) return 60;
    else if (cantidad < 360) return 120;
    else if (cantidad < 560) return 360;
    else if (cantidad < 960) return 560;
    else if (cantidad < 1320) return 960;
    else if (cantidad < 1920) return 1320;
    else if (cantidad >= 1920) return 2000;
  }
};

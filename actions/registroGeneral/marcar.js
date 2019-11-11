var BaseAction = require("../../operation/baseAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");
var moment = require("moment-timezone");

module.exports = class Reintentar extends BaseAction {
  execute(table, body) {
    this.table = table;
    this.body = body;
    return this.marcar(table, body);
  }

  async getCorte(createdAt) {
    var corte = await this.knex.table("registroContinuo").where("createdAt", createdAt);
    var corte = corte.map(item => {
      return { [item.tipo]: item.monto };
    });
    var corteItem = {};
    corte.forEach(item => {
      var keys = Object.keys(item);
      corteItem[keys[0]] = item[keys[0]];
    });
    return corteItem;
  }

  async getActual() {
    var inventario = await this.knex
      .table("producto")
      .select(this.knex.raw("sum(producto.inventario * costoHistorico.costo) as total"))
      .innerJoin("costoHistorico", "costoHistorico.id", "producto.costoHistoricoId");

    var saldo = await this.knex.table("saldo").sum("total as total");

    var saldoCxP = await this.knex.table("facturaCxP").sum("saldo as total");

    return {
      inventario: inventario[0].total,
      saldo: saldo[0].total,
      saldoCxP: saldoCxP[0].total
    };
  }

  async marcar(table, body) {
    var inicia = await this.getCorte(body.createdAt);
    var actual = await this.getCorte(body.finishedAt);
    var delta = await this.getDelta(body.createdAt, body.finishedAt);

    function getValue(obj /*, level1, level2, ... levelN*/) {
      var args = Array.prototype.slice.call(arguments, 1);

      for (var i = 0; i < args.length; i++) {
        if (!obj || !obj.hasOwnProperty(args[i])) {
          return 0;
        }
        obj = obj[args[i]];
      }
      return obj || 0;
    }

    var diff = {};
    var inventario1 = Number.dineroNumber(
      getValue(inicia, "inventario"),
      getValue(delta, "movimientoInventario", "valor"),
      "minus"
    );
    diff.inventario = Number.dineroNumber(inventario1, getValue(actual, "inventario"), "minus");
    diff.inventario;

    var saldo1 = Number.dineroNumber(
      getValue(inicia, "saldo"),
      getValue(delta, "documento", "FA", "credito", "total"),
      "plus"
    );
    var saldo2 = Number.dineroNumber(saldo1, getValue(delta, "documento", "NC", "credito", "total"), "plus");
    var saldo3 = Number.dineroNumber(saldo2, getValue(delta, "documento", "ND", "credito", "total"), "plus");
    var saldo4 = Number.dineroNumber(saldo3, getValue(delta, "pago", "credito", "monto"), "plus");
    diff.saldo = Number.dineroNumber(saldo4, getValue(actual, "saldo"), "minus");

    var cxp1 = Number.dineroNumber(getValue(inicia, "saldoCxP"), getValue(actual, "saldoCxP"), "minus");
    var cxp2 = Number.dineroNumber(cxp1, getValue(delta, "facturaCxP", "total"), "plus");
    diff.saldoCxP = Number.dineroNumber(cxp2, getValue(delta, "pagoCxP", "monto"), "minus");

    return {
      inicia: inicia,
      actual: actual,
      delta: delta,
      diff: diff
    };
  }

  async getDelta(fechaCorteInicial, fechaCorteFinal) {
    var movimientoInventario = await this.knex
      .table("movimientoInventario")
      .select("movimientoInventario.tipo")
      .select(
        this.knex.raw(
          "sum(movimientoInventario.cantidad * (case when movimientoInventario.tipo = 'CO' then costoHistorico.costoIngresado else costoHistorico.costo end)) as valor"
        )
      )
      .sum("subTotalConDescuento as subTotal")
      .sum("total as total")
      .innerJoin("costoHistorico", "costoHistorico.id", "movimientoInventario.costoHistoricoId")
      .where("movimientoInventario.createdAt", ">=", fechaCorteInicial)
      .where("movimientoInventario.createdAt", "<=", fechaCorteFinal)
      .groupBy("tipo");

    var movimientosByTipo = {};
    var valor = 0;
    var total = 0;
    var subTotal = 0;
    movimientoInventario.forEach(movimiento => {
      var tipo = movimiento.tipo;
      subTotal += movimiento.subTotal;
      total += movimiento.total;
      valor += movimiento.valor;

      if (!movimientosByTipo[tipo]) movimientosByTipo[tipo] = { valor: 0, subTotal: 0, total: 0 };
      movimientosByTipo[tipo].valor += movimiento.valor;
      movimientosByTipo[tipo].total += movimiento.total;
      movimientosByTipo[tipo].subTotal += movimiento.subTotal;
    });
    movimientosByTipo.valor = valor;
    movimientosByTipo.subTotal = subTotal;
    movimientosByTipo.total = total;

    movimientoInventario.push({
      tipo: "Total",
      valor: movimientosByTipo.valor,
      subTotal: movimientosByTipo.subTotal,
      total: movimientosByTipo.total
    });

    var documentosByTipo = {};
    var documento = await this.knex
      .table("documento")
      .select("tipo")
      .select(this.knex.raw(`(case when plazo = 0 then 'contado' else 'credito' end) as tipoPlazo`))
      .sum("totalVentaNeta as subTotal")
      .sum("totalImpuesto as impuesto")
      .sum("totalComprobante as total")
      .where("createdAt", ">=", fechaCorteInicial)
      .where("createdAt", "<=", fechaCorteFinal)
      .groupBy("tipo", "tipoPlazo");

    var sumTotalComprobante = 0;
    var sumTotalImpuesto = 0;
    var sumTotalVentaNeta = 0;

    documento.forEach(documento => {
      sumTotalComprobante += documento.total;
      sumTotalImpuesto += documento.impuesto;
      sumTotalVentaNeta += documento.subTotal;

      if (!documentosByTipo[documento.tipo])
        documentosByTipo[documento.tipo] = {
          contado: {
            total: 0,
            impuesto: 0,
            subTotal: 0
          },
          credito: {
            total: 0,
            impuesto: 0,
            subTotal: 0
          }
        };
      documentosByTipo[documento.tipo][documento.tipoPlazo].total += documento.total;
      documentosByTipo[documento.tipo][documento.tipoPlazo].impuesto += documento.impuesto;
      documentosByTipo[documento.tipo][documento.tipoPlazo].subTotal += documento.subTotal;
    });
    documentosByTipo.impuesto = sumTotalImpuesto;
    documentosByTipo.subTotal = sumTotalVentaNeta;
    documentosByTipo.total = sumTotalComprobante;

    documento.push({
      tipo: "Total",
      tipoPlazo: "",
      subTotal: sumTotalVentaNeta,
      impuesto: sumTotalImpuesto,
      total: sumTotalComprobante
    });

    var pagoPorTipo = {};
    var sumPago = 0;
    var pagos = await this.knex
      .table("pagoDocumento")
      .select(this.knex.raw(`(case when contado = 1 then 'contado' else 'credito' end) as tipoPlazo`))
      .sum("monto as monto")
      .where("estado", "archivado")
      .where("fechaIngreso", ">=", fechaCorteInicial)
      .where("fechaIngreso", "<", fechaCorteFinal)
      .groupBy("tipoPlazo");

    pagos.forEach(pago => {
      pago.monto = pago.monto * -1;
      sumPago += pago.monto;
      if (!pagoPorTipo[pago.tipoPlazo]) pagoPorTipo[pago.tipoPlazo] = { monto: 0 };
      pagoPorTipo[pago.tipoPlazo].monto += pago.monto;
    });
    pagoPorTipo.total = sumPago;

    pagos.push({
      tipo: "Total",
      tipoPlazo: "",
      monto: sumPago
    });

    var lineaPagoPorTipo = {};
    var sumLineaPagoPorTipo = 0;
    var lineasPago = await this.knex
      .table("lineaPagoDocumento")
      .select("lineaPagoDocumento.tipoDocumento as tipo")

      .select(
        this.knex.raw(`(case when pagoDocumento.contado = 1 then 'contado' else 'credito' end) as tipoPlazo`)
      )
      .sum("lineaPagoDocumento.monto as monto")
      .innerJoin("pagoDocumento", "pagoDocumento.id", "lineaPagoDocumento.pagoDocumentoId")
      .where("pagoDocumento.estado", "archivado")
      .where("pagoDocumento.fechaIngreso", ">=", fechaCorteInicial)
      .where("pagoDocumento.fechaIngreso", "<", fechaCorteFinal)
      .groupBy("tipoPlazo", "lineaPagoDocumento.tipoDocumento");

    lineasPago.forEach(lineaPago => {
      lineaPago.monto = (lineaPago.monto || 0) * -1;
      sumLineaPagoPorTipo += lineaPago.monto;
      if (!lineaPagoPorTipo[lineaPago.tipo])
        lineaPagoPorTipo[lineaPago.tipo] = {
          contado: 0,
          credito: 0
        };
      lineaPagoPorTipo[lineaPago.tipo][lineaPago.tipoPlazo] += lineaPago.monto;
    });
    lineaPagoPorTipo.total = sumLineaPagoPorTipo;

    lineasPago.push({
      tipo: "Total",
      tipoPlazo: "",
      monto: sumLineaPagoPorTipo
    });

    var facturaCxPPorTipo = {};
    var sumFacturaCxP = 0;

    var facturasCxP = await this.knex
      .table("facturaCxP")
      .select("tipo")
      .sum("total as total")
      .where("fechaIngreso", ">=", fechaCorteInicial)
      .where("fechaIngreso", "<=", fechaCorteFinal)
      .groupBy("tipo");

    facturasCxP.forEach(facturaCxP => {
      sumFacturaCxP += facturaCxP.total;
      if (!facturaCxPPorTipo[facturaCxP.tipo]) facturaCxPPorTipo[facturaCxP.tipo] = { total: 0 };
      facturaCxPPorTipo[facturaCxP.tipo].total += facturaCxP.total;
    });
    facturaCxPPorTipo.total = sumFacturaCxP;

    facturasCxP.push({
      tipo: "Total",
      total: sumFacturaCxP
    });

    var pagoCxPPorTipo = {};
    var sumPagoCxP = 0;
    var pagosCxP = await this.knex
      .table("lineaPagoCxP")
      .select("tipo")
      .sum("monto as monto")
      .where("createdAt", ">=", fechaCorteInicial)
      .where("createdAt", "<=", fechaCorteFinal)
      .groupBy("tipo");

    pagosCxP.forEach(pagoCxP => {
      sumPagoCxP += pagoCxP.monto;
      if (!pagoCxPPorTipo[pagoCxP.tipo]) pagoCxPPorTipo[pagoCxP.tipo] = { monto: 0 };
      pagoCxPPorTipo[pagoCxP.tipo].monto += pagoCxP.monto;
    });
    pagoCxPPorTipo.monto = sumPagoCxP;

    pagosCxP.push({
      tipo: "Total",
      monto: sumPagoCxP
    });

    pagosCxP.forEach(pago => {
      pago.monto = pago.monto * -1;
    });

    return {
      movimientoInventario: movimientosByTipo,
      documento: documentosByTipo,
      pago: pagoPorTipo,
      lineaPago: lineaPagoPorTipo,
      facturaCxP: facturaCxPPorTipo,
      pagoCxP: pagoCxPPorTipo,
      lists: {
        movimientoInventario: movimientoInventario,
        documento: documento,
        pago: pagos,
        lineasPago: lineasPago,
        facturaCxP: facturasCxP,
        pagoCxP: pagosCxP
      }
    };
  }
};

/*
    var promises = [];

    var transform = (name, list) => {

      list.forEach((listItem) => {
        var tipo = listItem.tipo || "todos";
        var montos = Object.keys(listItem).filter((key) => {
          if (typeof listItem[key] != "string") return true;
          return false;
        })
        montos.forEach((montoKey) => {
          var tipoPlazo = listItem.tipoPlazo || "absoluto";
          var registroRegular = {
            tipoPlazo: tipoPlazo,
            field: montoKey,
            metadataType: name,
            momento: momento,
            fecha: moment().format("YYYY-MM-DD"),
            tipo: tipo,
            monto: listItem[montoKey],
            namespaceId: process.env.NODE_ENV
          }
          console.log(registroRegular);
          promises.push(this.knex.table("registroGeneral").insert(registroRegular))
        })
      })
    }

    transform("movimientoInventario", movimientoInventario);
    transform("documento", documento);
    transform("pago", pago);
    transform("facturaCxP", facturaCxp);
    transform("pagoCxP", pagoCxP);

    return Promise.all(promises);

  }

}

*/

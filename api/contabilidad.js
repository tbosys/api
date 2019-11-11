const Errors = require("../errors");

var BaseOperation = require("../operation/baseOperation");
var Parser = require("../apiHelpers/xmlParser");
var moment = require("moment-timezone");

class Cliente extends BaseOperation {
  get table() {
    return "";
  }

  async contabilidadHistorico() {
    var inventario = await this.knex("producto")
      .innerJoin("costoHistorico", "costoHistorico.id", "producto.costoHistoricoId")
      .select(this.knex.raw("sum( producto.inventario * costoHistorico.costo) as valor"))
      .first();

    var saldo = await this.knex("saldo")
      .sum("total as total")
      .first();

    var saldoCxP = await this.knex("facturaCxP")
      .sum("saldo as saldo")
      .first();

    var documentosCredito = await this.knex("documento")
      .select("documento.tipo")
      .sum("totalVentaNeta as subTotal")
      .sum("totalComprobante as total")
      .sum("totalImpuesto as impuesto")
      .sum("totalExcento as exento")
      .sum("totalGravado as gravado")
      .whereNotIn("estado", ["por aprobar", "por aplicar", "por esperar", "por facturar"])
      .where(
        "fecha",
        ">",
        moment()
          .startOf("month")
          .format("YYYY-MM-DD")
      )
      .where("plazo", ">", 0)
      .where({ estado: "archivado" })
      .groupBy(["documento.tipo", "documento.plazo"]);

    var creditoMap = { FA: {}, NC: {}, ND: {} };
    documentosCredito.forEach(documento => {
      creditoMap[documento.tipo] = documento;
    });

    var documentosContado = await this.knex("documento")
      .select("documento.tipo")
      .sum("totalVentaNeta as subTotal")
      .sum("totalComprobante as total")
      .sum("totalImpuesto as impuesto")
      .sum("totalExcento as exento")
      .sum("totalGravado as gravado")
      .whereNotIn("estado", ["por aprobar", "por aplicar", "por esperar", "por facturar"])
      .where(
        "fecha",
        ">",
        moment()
          .startOf("month")
          .format("YYYY-MM-DD")
      )
      .where("plazo", "=", 0)
      .groupBy(["documento.tipo", "documento.plazo"]);

    var pagos = await this.knex("pagoDocumento")
      .sum("monto as monto")
      .whereIn("estado", ["archivado"])
      .where(
        "fecha",
        ">",
        moment()
          .startOf("month")
          .format("YYYY-MM-DD")
      )
      .first();

    var facturaCxP = await this.knex("facturaCxP")
      .sum("total as total")
      .whereIn("estado", ["archivado"])
      .where(
        "fechaFactura",
        ">",
        moment()
          .startOf("month")
          .format("YYYY-MM-DD")
      )
      .first();

    var contadoMap = { FA: {}, NC: {}, ND: {} };
    documentosContado.forEach(documento => {
      contadoMap[documento.tipo] = documento;
    });

    var movimientos = await this.knex("movimientoInventario")
      .innerJoin("documento", "documento.id", "movimientoInventario.documentoId")
      .innerJoin("costoHistorico", "costoHistorico.id", "movimientoInventario.costoHistoricoId")
      .select(this.knex.raw("sum( movimientoInventario.cantidad * costoHistorico.costo) as valor"))
      .select(["movimientoInventario.tipo", "documento.plazo"])
      .where(
        "documento.fecha",
        ">",
        moment()
          .startOf("month")
          .format("YYYY-MM-DD")
      )
      .groupBy(["movimientoInventario.tipo", "documento.plazo"]);

    var movimientoMap = { EN: 0, SA: 0, CO: 0, FA: 0, NC: 0, ND: 0 };
    movimientos.forEach(movimiento => {
      if (movimiento.tipo == "FA" && movimiento.plazo == 0)
        movimientoMap[movimiento.tipo + "_Contado"] = movimiento.valor;
      else if (movimiento.tipo == "FA" && movimiento.plazo > 0)
        movimientoMap[movimiento.tipo + "_Credito"] = movimiento.valor;
      else movimientoMap[movimiento.tipo] = movimiento.valor;
    });

    var insertQuery = this.knex("contabilidadHistorico")
      .insert({
        namespaceId: process.env.NODE_ENV,
        updatedAt: moment().format("YYYY-MM-DD"),
        valorInventarios: inventario.valor,
        valorSaldosDocumento: saldo.total,
        valorSaldosCxP: saldoCxP.saldo,

        documentoFacturasContadoNeto: contadoMap["FA"].subTotal || 0,
        documentoFacturasCreditoNeto: creditoMap["FA"].subTotal || 0,
        documentoNotasCreditoNeto: creditoMap["NC"].subTotal || 0,
        documentoNotasDebitoNeto: creditoMap["ND"].subTotal || 0,

        documentoFacturasContadoGravado: contadoMap["FA"].gravado || 0,
        documentoFacturasCreditoGravado: creditoMap["FA"].gravado || 0,
        documentoNotasCreditoGravado: creditoMap["NC"].gravado || 0,
        documentoNotasDebitoGravado: creditoMap["ND"].gravado || 0,

        documentoFacturasContadoExento: contadoMap["FA"].exento || 0,
        documentoFacturasCreditoExento: creditoMap["FA"].exento || 0,
        documentoNotasCreditoExento: creditoMap["NC"].exento || 0,
        documentoNotasDebitoExento: creditoMap["ND"].exento || 0,

        documentoFacturasContadoImpuesto: contadoMap["FA"].impuesto || 0,
        documentoFacturasCreditoImpuesto: creditoMap["FA"].impuesto || 0,
        documentoNotasCreditoImpuesto: creditoMap["NC"].impuesto || 0,
        documentoNotasDebitoImpuesto: creditoMap["ND"].impuesto || 0,

        documentoFacturasContadoDescuento: contadoMap["FA"].descuento || 0,
        documentoFacturasCreditoDescuento: creditoMap["FA"].descuento || 0,
        documentoNotasCreditoDescuento: creditoMap["NC"].descuento || 0,
        documentoNotasDebitoDescuento: creditoMap["ND"].descuento || 0,

        documentoFacturasContadoTotal: contadoMap["FA"].total || 0,
        documentoFacturasCreditoTotal: creditoMap["FA"].total || 0,
        documentoNotasCreditoTotal: creditoMap["NC"].total || 0,
        documentoNotasDebitoTotal: creditoMap["ND"].total || 0,

        inventarioCostoEntradas: movimientoMap["EN"] || 0,
        inventarioCostoSalidas: movimientoMap["SA"] || 0,
        inventarioCostoCompras: movimientoMap["CO"] || 0,
        inventarioCostoNotasCredito: movimientoMap["NC"] || 0,
        inventarioCostoNotasDebito: movimientoMap["ND"] || 0,
        inventarioCostoFacturas: movimientoMap["FA"] || 0,
        inventarioCostoTotal:
          movimientoMap["EN"] +
          movimientoMap["SA"] +
          movimientoMap["CO"] +
          movimientoMap["FA"] +
          movimientoMap["NC"] +
          movimientoMap["ND"],
        totalGastos: 0,
        totalImpuestoSaldos: 0,
        FacturasCxpTotal: facturaCxP && facturaCxP.total ? facturaCxP.total : 0,
        PagosCxPTotal: 0,
        PagosDocumentoTotal: pagos && pagos.monto ? pagos.monto : 0,
        fecha: moment().format("YYYY-MM-DD")
      })
      .toString()
      .replace(/^INSERT/i, "REPLACE");

    return await this.knex.raw(insertQuery);

    return { inventario: inventario.valor, saldo: saldo.total, saldoCxP: saldoCxP.saldo };
  }

  get multiTenantObject() {
    return true;
  }
}

module.exports = Cliente;

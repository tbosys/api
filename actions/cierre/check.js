var QueryAction = require("../../operation/baseQueryAction");
var Errors = require("../../errors");
var moment = require("moment-timezone");

module.exports = class PagoCreateAction extends QueryAction {

  async query(body) {

    function orZero(value) {
      var keys = Object.keys(value);
      keys.forEach((key) => {
        return value[key] = value[key] || 0;
      })
      return value;
    }

    var productos = await this.knex.table("producto")
      .innerJoin("costoHistorico", "costoHistorico.id", "producto.costoHistoricoId")
      .select(this.knex.raw("sum(producto.inventario * costoHistorico.costo) as valor"))
      .first();

    var movimientoInventarioCredito = await this.knex.table("movimientoInventario").sum("subTotalConDescuento as movimientoCredito")
      .innerJoin("documento", "documento.id", "movimientoInventario.documentoId")
      .whereBetween("movimientoInventario.fecha", [moment().startOf('month').format('YYYY-MM-DD'), moment().format("YYYY-MM-DD")])
      .whereNot("documento.plazo", 0)
      .first()

    var movimientoInventarioContado = await this.knex.table("movimientoInventario").sum("subTotalConDescuento as movimientoContado")
      .innerJoin("documento", "documento.id", "movimientoInventario.documentoId")
      .whereBetween("movimientoInventario.fecha", [moment().startOf('month').format('YYYY-MM-DD'), moment().format("YYYY-MM-DD")])
      .where("documento.plazo", 0)

      .first();

    var registroGeneral = await this.knex.table("registroGeneral").where("momento", "AM").where("fecha", moment().format("YYYY-MM-DD"));
    var registroGeneralMap = {};
    registroGeneral.forEach((registro) => {
      registroGeneralMap[registro.tipo] = registro.monto;
    })

    var registros = await this.knex.table("registro").where("fecha", moment().format("YYYY-MM-DD"));
    var registroMap = {
      ventasCredito: 0, ventasContado: 0
    };
    registros.forEach((registro) => {

      if (registro.metadataType == "documento") {
        var metadata = JSON.parse(registro.metadata);
        if (metadata.plazo == 0)
      }

    })


    var saldos = await this.knex.table("saldo").sum("total as saldo").first();
    var ventasCredito = await this.knex.table("documento")
      .sum("totalVentaNeta as ventaCredito")
      .sum("totalImpuesto as impuestoContado")

      .where("plazo", ">", 0).whereBetween("fecha", [moment().startOf('month').format('YYYY-MM-DD'), moment().format("YYYY-MM-DD")]).first();

    var ventasContado = await this.knex.table("documento").sum("totalVentaNeta as ventaContado")
      .sum("totalImpuesto as impuestoCredito")
      .where("plazo", 0)

      .whereBetween("fecha", [moment().startOf('month').format('YYYY-MM-DD'), moment().format("YYYY-MM-DD")]).first();

    var pagoCredito = await this.knex.table("pagoDocumento").sum("monto as pago")
      .where("estado", "archivado")

      .whereNot("contado", 0).whereBetween("fecha", [moment().startOf('month').format('YYYY-MM-DD'), moment().format("YYYY-MM-DD")]).first();

    var pagoContado = await this.knex.table("pagoDocumento").sum("monto as pago")
      .where("estado", "archivado")

      .whereNot("contado", 1).whereBetween("fecha", [moment().startOf('month').format('YYYY-MM-DD'), moment().format("YYYY-MM-DD")]).first();

    var facturaCxp = await this.knex.table("facturaCxP")
      .sum("total as facturaCxp").whereBetween("fechaFactura", [moment().startOf('month').format('YYYY-MM-DD'), moment().format("YYYY-MM-DD")])

      .first();

    var saldoCxP = await this.knex.table("facturaCxP").sum("saldo as saldoCxP")

      .first();

    var pagoCxP = await this.knex.table("pagoCxP")
      .sum("monto as pagoCxP")

      .whereBetween("fecha", [moment().startOf('month').format('YYYY-MM-DD'), moment().format("YYYY-MM-DD")]).first();

    return {
      ...orZero(productos),
      ...orZero(saldos),
      ...orZero(ventasCredito),
      ...orZero(ventasContado),
      ...orZero(pagoContado),
      ...orZero(movimientoInventarioContado),
      ...orZero(movimientoInventarioCredito),
      ...orZero(pagoCredito),
      ...orZero(facturaCxp),
      ...orZero(saldoCxP),
      ...orZero(pagoCxP),
      registros: registros,
      apertura: { ...orZero(registroGeneralMap) }

    }
  }

}

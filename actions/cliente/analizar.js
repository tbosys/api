var QueryAction = require("../../operation/baseQueryAction");
var Errors = require("../../errors");
var moment = require("moment-timezone");
var numeral = require("numeral");

module.exports = class RegistroRecentQuery extends QueryAction {
  get secure() {
    return false;
  }
  async query(body) {
    var clientes = await this.knex("cliente")
      .select()
      .whereIn("id", body.ids);

    var saldos = await this.loadSaldos(body.ids);
    var ventas = await this.loadVentas(body.ids);
    var pagos = await this.loadPagos(body.ids);
    var YTD = await this.getYTD(body.ids);
    var BAT = await this.getPagos(body.ids);
    var PPA = await this.getPagosPendientes(body.ids);
    var audit = await this.loadAudit(body.ids);

    return {
      title: this.getTitle(clientes),
      metrics: [YTD, BAT, PPA],
      saldos: saldos,
      ventas: ventas,
      audit: audit,
      pagos: pagos
    };
  }

  getTitle(clientes) {
    if (clientes.length == 1) return clientes[0].name.toLowerCase();
    else if (clientes.length < 4)
      return clientes.map(cliente => cliente.name.substring(0, 10).toLowerCase()).join(",");
    return `${clientes.length} clientes`;
  }

  async getYTD(ids) {
    var result = await this.knex("documento")
      .sum("totalVentaNeta as total")
      .whereIn("clienteId", ids)
      .where("fecha", ">=", this.getFiscalYear().start.format("YY-MM-DD"));
    return { label: "VAA", value: numeral(result[0].total / 1000000).format("0.0") + "MM" };
  }

  async getPagos(ids) {
    var result = await this.knex("lineaPagoDocumento")
      .select(this.knex.raw("DATEDIFF(lineaPagoDocumento.fecha,documento.fecha) as diasPago"))
      .innerJoin("documento", "documento.id", "lineaPagoDocumento.documentoId")
      .whereIn("clienteId", ids)
      .where("documento.tipo", "FA")
      .where(
        "lineaPagoDocumento.fecha",
        ">=",
        moment()
          .add(-4, "months")
          .startOf("month")
          .format("YY-MM-DD")
      );

    var max = 0;
    var min = 100000;
    var avg = 0;
    var total = 0;
    result.forEach(item => {
      if (item.diasPago > max) max = item.diasPago;
      if (item.diasPago < min) min = item.diasPago;
      total += item.diasPago;
    });
    avg = total / result.length;
    return { label: "DPC", value: (avg ? parseInt(avg) : " - ") + " días", min: min, max: max };
  }

  async loadVentas(ids) {
    var result = await this.knex("documento")
      .sum("totalVentaNeta as total")
      .select(this.knex.raw("DATE_FORMAT(fecha, '%Y%m') as mes"))
      .whereIn("clienteId", ids)
      .where(
        "fecha",
        ">=",
        moment()
          .add(-4, "months")
          .startOf("month")
          .format("YY-MM-DD")
      )
      .groupBy(this.knex.raw("DATE_FORMAT(fecha, '%Y%m')"));
    return result.map(item => {
      item.mes = item.mes.substring(4) + "/" + item.mes.substring(2, 4);
      return item;
    });
  }

  async loadPagos(ids) {
    var result = await this.knex("lineaPagoDocumento")
      .sum("lineaPagoDocumento.monto as total")
      .select(this.knex.raw("DATE_FORMAT(lineaPagoDocumento.fecha, '%Y%m') as mes"))
      .innerJoin("documento", "documento.id", "lineaPagoDocumento.documentoId")
      .whereIn("clienteId", ids)
      .where("documento.tipo", "FA")
      .where("estado", "archivado")
      .where(this.knex.raw("DATEDIFF(lineaPagoDocumento.fecha,documento.fecha) > 50"))
      .where(
        "lineaPagoDocumento.fecha",
        ">=",
        moment()
          .add(-3, "months")
          .startOf("month")
          .format("YY-MM-DD")
      )
      .groupBy(["mes"]);
    return result.map(item => {
      item.mes = item.mes.substring(4) + "/" + item.mes.substring(2, 4);
      return item;
    });
  }

  async getPagosPendientes(ids) {
    var result = await this.knex("lineaPagoDocumento")
      .sum("lineaPagoDocumento.monto as total")
      .innerJoin("documento", "documento.id", "lineaPagoDocumento.documentoId")
      .whereIn("clienteId", ids)
      .where("documento.tipo", "FA")
      .whereNot("estado", "archivado");

    return {
      label: "PPA",
      value: "c/" + numeral(parseFloat(result[0].total || 0) / 1000000).format("0,0.00"),
      min: 0,
      max: 0
    };
  }

  async loadSaldos(ids) {
    var saldos = await this.knex("saldo")
      .sum("total as total")

      .select(
        this.knex.raw(
          "CASE when DATEDIFF(CURRENT_DATE(),saldo.fecha) < 30 then 30 when DATEDIFF(CURRENT_DATE(),saldo.fecha) < 45 then 45 when DATEDIFF(CURRENT_DATE(),saldo.fecha)  < 60 then 60 when DATEDIFF(CURRENT_DATE(),saldo.fecha) < 90 then 90 else +90 END as grupo"
        )
      )
      .where("tipo", "FA")
      .whereIn("clienteId", ids)
      .groupBy("grupo");

    return saldos;
  }

  loadAudit(ids) {
    return this.knex("audit")

      .select()
      .where("metadata", "cliente")
      .whereIn("metadataid", ids);
  }

  getFiscalYear() {
    if (moment().quarter() == 4) {
      var current_fiscal_year_start = moment()
        .month("October")
        .startOf("month");
      var current_fiscal_year_end = moment()
        .add("year", 1)
        .month("September")
        .endOf("month");
      var last_fiscal_year_start = moment()
        .subtract("year", 1)
        .month("October")
        .startOf("month");
      var last_fiscal_year_end = moment()
        .month("September")
        .endOf("month");
    } else {
      var current_fiscal_year_start = moment()
        .subtract("year", 1)
        .month("October")
        .startOf("month");
      var current_fiscal_year_end = moment()
        .month("September")
        .endOf("month");
      var last_fiscal_year_start = moment()
        .subtract("year", 2)
        .month("October")
        .startOf("month");
      var last_fiscal_year_end = moment()
        .subtract("year", 1)
        .month("September")
        .endOf("month");
    }
    return {
      start: current_fiscal_year_start,
      end: current_fiscal_year_end
    };
  }
};

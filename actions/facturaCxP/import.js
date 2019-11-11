var BaseAction = require("../../operation/baseCreateAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");
var Parser = require("../../apiHelpers/xmlParser");
var CedulaMap = require("../../model/cedula");

module.exports = class FacturaImportAction extends BaseAction {

  execute(table, body) {
    this.table = table;
    this.body = body;
    return this.importar(table, body);
  }

  importar(table, body) {
    var createProveedor = this.getActionInstanceFor("proveedor", "create");
    var createFactura = this.getActionInstanceFor("facturaCxP", "create");

    var results;
    return Parser.facturaProveedor(body)
      .then((response) => {
        results = response;
        return this.knex.table("proveedor").select(["id"]).where({ cedula: results.proveedor.cedula.numero })
      })
      .then((proveedorResults) => {
        if (proveedorResults.length == 0) return createProveedor.execute("proveedor", {
          name: results.proveedor.nombre,
          email: results.proveedor.email || "",
          telefono: results.proveedor.telefono || "",
          tipoCedula: CedulaMap[results.proveedor.cedula.tipo],
          cedula: results.proveedor.cedula.numero,
          moneda: "CRC"
        })
        else return proveedorResults[0]
      })
      .then((proveedor) => {
        var factura = {
          estado: "por aceptar",
          proveedorId: proveedor.id,
          referencia: results.clave,
          fechaFactura: results.fechaEmision,
          subTotal: results.totales.subtotal,
          tipoCambio: results.totales.tipoCambio,
          moneda: results.totales.moneda,
          impuesto: results.totales.impuesto,
          descuento: results.totales.descuento,
          total: results.totales.total,
          saldo: results.totales.total
        }

        return createFactura.execute("facturaCxP", factura);
      })



  }

}
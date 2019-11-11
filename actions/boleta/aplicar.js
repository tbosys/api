const Dinero = require("dinero.js");
Dinero.globalLocale = "es-CR";
Dinero.defaultPrecision = 5;

var BaseAction = require("../../operation/baseAction");
var Errors = require("../../errors");

var moment = require("moment-timezone");
var xero = require("../../apiHelpers/xero");

module.exports = class DefaultUpdateAction extends BaseAction {
  execute(table, body) {
    this.table = table;
    this.body = body;
    return this.aplicar(table, body);
  }

  async aplicar(table, body) {
    var id = this.enforceSingleId(body);
    await this.enforceStatus(body, "por aplicar");

    var boleta = await this.knex
      .table(table)
      .select()
      .where("id", id)
      .forUpdate()
      .first();

    var delta = { estado: "archivado", updatedAt: moment().format("YYYY-MM-DD"), updatedBy: this.user.name };

    await this.knex
      .table(table)
      .update(delta)
      .where("id", id);

    await this.saveAudit(id, "aplicar", delta);

    var movimientos = JSON.parse(boleta.movimientoInventario);

    if (movimientos.length == 0)
      throw new Errors.VALIDATION_ERROR("La boleta tiene que tener movimientos y no tiene.");

    movimientos.forEach(movimiento => {
      //if (movimiento.tipo != boleta.tipo) throw new Errors.VALIDATION_ERROR("La lineas son de otro tipo de boleta.");
      if (!movimiento.mercancia)
        throw new Errors.VALIDATION_ERROR(
          `El producto ${movimiento.__productoId} no es una mercancia y no tiene inventario`
        );
      if (!movimiento.cantidad || movimiento.cantidad <= 0)
        throw new Errors.VALIDATION_ERROR("La boleta tiene cantidades en cero.");
      if (boleta.tipo == "CO" && (!movimiento.costo || movimiento.costo <= 0))
        throw new Errors.VALIDATION_ERROR("La boleta tiene un costo en cero.");
    });

    if (boleta.tipo == "DE") {
      var action = this.getActionInstanceFor("documento", "devolver");
      return action.execute("documento", {
        boleta: boleta,
        movimientos: movimientos
      });
    }

    var boletaPromises = [];
    if (boleta.tipo == "CO") {
      boletaPromises = movimientos.map(linea => {
        var action = this.getActionInstanceFor("costoHistorico", "create");
        return action.execute("costoHistorico", {
          activo: true,
          costo: 0,
          cantidad: linea.cantidad,
          costoIngresado: linea.costo,
          productoId: linea.productoId
        });
      });
      await Promise.all(boletaPromises);
    }

    var movimientoPromises = movimientos.map((linea, index) => {
      var movimiento = {
        costo: linea.costo || 0,
        cantidad: linea.cantidad,
        precio: linea.precio,
        subTotal: linea.subTotal,
        subTotalConDescuento: linea.subTotalConDescuento,
        impuesto: linea.impuesto,
        descuento: linea.descuento,
        total: linea.total,
        impuestoUnitario: linea.impuestoUnitario,
        descuentoUnitario: linea.descuentoUnitario,
        medida: linea.medida,
        mercancia: linea.mercancia,
        detalle: linea.detalle,
        productoId: linea.productoId,
        tipo: boleta.tipo,
        fecha: moment().format("YYYY-MM-DD"),
        numeroLinea: index + 1,
        boletaId: id
      };
      var action = this.getActionInstanceFor("movimientoInventario", "create");
      return action.execute("movimientoInventario", movimiento);
    });

    await Promise.all(movimientoPromises);

    if (boleta.tipo != "DE") await xero({ id: boleta.id, type: "BOLETA" }, this.context);

    return body;
  }
};

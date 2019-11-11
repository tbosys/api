var BaseAction = require("../../operation/baseCreateAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");

module.exports = class DefaultCreateAction extends BaseAction {
  preValidate() {
    this.fromAnular = this.body.fromAnular;

    delete this.body.fromAnular;
  }

  async preInsert() {
    this.plazo = this.body.plazo;
    delete this.body.plazo;
    delete this.body.costo; // por UI que puede enviar costo en EN,SA. Costo Ingresado en CO ya fue usado.

    this.producto = null;
    if (this.body.productoId)
      this.producto = await this.knex
        .table("producto")
        .select(["costoHistoricoId", "mercancia"])
        .where("id", this.body.productoId)
        .first();

    if (this.producto && this.producto.mercancia) {
      this.costo = await this.knex
        .table("costoHistorico")
        .select(["id", "costo", "costoIngresado"])
        .where({ id: this.producto.costoHistoricoId })
        .first();

      if (this.costo) {
        this.body.costoHistoricoId = this.costo.id;
        this.montoCosto = this.costo.costo;
        var movimiento = this.body;
        this.body.utilidad = ((movimiento.precio - (movimiento.precio * movimiento.descuentoUnitario / 100))-this.montoCosto)/(movimiento.precio - (movimiento.precio * movimiento.descuentoUnitario / 100)) || 0;
      } else throw new Errors.VALIDATION_ERROR("El movimiento tienen que tener un costo.");
    }

    if (this.body.tipo == "EN" || this.body.tipo == "CO" || this.body.tipo == "NC")
      this.body.cantidad = this.body.cantidad * -1;

    if (this.body.tipo == "EN" || this.body.tipo == "CO" || this.body.tipo == "SA") {
      this.body.total = 0;
      this.body.subTotal = 0;
      this.body.impuesto = 0;
      this.body.descuento = 0;
      this.body.descuentoUnitario = 0;
      this.body.impuestoUnitario = 0;
      this.body.subTotalConDescuento = 0;
    }

    if (this.body.tipo == "NC") {
      this.body.total = this.body.total * -1;
      this.body.subTotal = this.body.subTotal * -1;
      this.body.impuesto = this.body.impuesto * -1;
      this.body.descuento = this.body.descuento * -1;
      this.body.subTotalConDescuento = this.body.subTotalConDescuento * -1;
    }

    if (this.body.tipo == "ND" && this.fromAnular) {
      this.body.cantidad = this.body.cantidad * -1;
      this.body.total = this.body.total * -1;
      this.body.subTotal = this.body.subTotal * -1;
      this.body.impuesto = this.body.impuesto * -1;
      this.body.descuento = this.body.descuento * -1;
      this.body.subTotalConDescuento = this.body.subTotalConDescuento * -1;
    }
  }

  async postInsert() {
    this.body.id = this.results[0];
    this.results = this.body;

    var registroMetadata = { tipo: this.body.tipo, plazo: this.plazo, productoId: this.body.productoId };
    var tipoPlazo = this.plazo === 0 ? "contado" : "credito";

    if (this.producto && this.producto.mercancia) {
      await this.createRegistro(
        this.body.productoId,
        "cantidad",
        "movimientoInventario",
        this.body.cantidad,
        registroMetadata,
        this.body.tipo,
        ""
      );

      if (["FA", "NC", "ND"].indexOf(this.body.tipo) > -1) {
        await this.createRegistro(
          this.body.id,
          "total",
          "movimientoInventario",
          this.body.total,
          registroMetadata,
          this.body.tipo,
          tipoPlazo
        );
        await this.createRegistro(
          this.body.id,
          "impuesto",
          "movimientoInventario",
          this.body.impuesto,
          registroMetadata,
          this.body.tipo,
          tipoPlazo
        );
        await this.createRegistro(
          this.body.id,
          "subTotalConDescuento",
          "movimientoInventario",
          this.body.subTotalConDescuento,
          registroMetadata,
          this.body.tipo,
          tipoPlazo
        );
        await this.createRegistro(
          this.body.id,
          "subTotal",
          "movimientoInventario",
          this.body.subTotal,
          registroMetadata,
          this.body.tipo,
          tipoPlazo
        );
        await this.createRegistro(
          this.body.id,
          "descuento",
          "movimientoInventario",
          this.body.descuento,
          registroMetadata,
          this.body.tipo,
          tipoPlazo
        );
      }

      if (this.body.productoId) {
        var delta = { cantidad: this.body.cantidad, productoId: this.body.productoId };
        try {
          await this.knex.raw(
            "UPDATE producto SET inventario = inventario - :cantidad WHERE id = :productoId",
            delta
          );
        } catch (e) {
          if (e.sqlMessage == "el inventario del producto no puede ser menor que 0")
            throw new Errors.VALIDATION_ERROR("El inventario del producto no puede ser menor que 0'");
          else throw e;
        }
      }

      if (this.body.tipo == "CO")
        await this.createRegistro(
          this.body.productoId,
          "valor",
          "producto",
          this.body.cantidad * this.costo.costoIngresado,
          registroMetadata,
          this.body.tipo,
          ""
        );
      else if (this.body.tipo == "SA" || this.body.tipo == "EN")
        await this.createRegistro(
          this.body.productoId,
          "valor",
          "producto",
          this.body.cantidad * this.montoCosto,
          registroMetadata,
          this.body.tipo,
          ""
        );
      else
        await this.createRegistro(
          this.body.productoId,
          "valor",
          "producto",
          this.body.cantidad * this.montoCosto,
          registroMetadata,
          this.body.tipo,
          tipoPlazo
        );
    } else {
      await this.createRegistro(
        this.body.productoId,
        "cantidad",
        "movimientoServicio",
        this.body.cantidad,
        registroMetadata,
        this.body.tipo,
        ""
      );

      if (["FA", "NC", "ND"].indexOf(this.body.tipo) > -1) {
        await this.createRegistro(
          this.body.id,
          "total",
          "movimientoServicio",
          this.body.total,
          registroMetadata,
          this.body.tipo,
          tipoPlazo
        );
        await this.createRegistro(
          this.body.id,
          "impuesto",
          "movimientoServicio",
          this.body.impuesto,
          registroMetadata,
          this.body.tipo,
          tipoPlazo
        );
        await this.createRegistro(
          this.body.id,
          "subTotalConDescuento",
          "movimientoServicio",
          this.body.subTotalConDescuento,
          registroMetadata,
          this.body.tipo,
          tipoPlazo
        );
        await this.createRegistro(
          this.body.id,
          "subTotal",
          "movimientoServicio",
          this.body.subTotal,
          registroMetadata,
          this.body.tipo,
          tipoPlazo
        );
        await this.createRegistro(
          this.body.id,
          "descuento",
          "movimientoServicio",
          this.body.descuento,
          registroMetadata,
          this.body.tipo,
          tipoPlazo
        );
      }
    }

    return true;
  }
};

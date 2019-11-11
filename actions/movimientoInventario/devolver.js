var BaseAction = require("../../operation/baseCreateAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");
const Dinero = require("dinero.js");
Dinero.globalLocale = "es-CR";
Dinero.defaultPrecision = 5;
var moment = require("moment-timezone");

module.exports = class DefaultUpdateAction extends BaseAction {
  execute(table, body) {
    this.table = table;
    this.body = body;
    return this.devolver(table, body);
  }

  async devolver(table, body) {
    body = body.ids;

    var movimientosIds = body.items.map(item => item.id);
    var itemMap = {};
    body.items.forEach(item => {
      itemMap[item.id] = item;
    });

    if (!body.boleta && !body.descripcion)
      throw new Errors.VALIDATION_ERROR("De ingresar ambos, el numero de boleta y descripción ");

    var movimientos = await this.knex
      .table("movimientoInventario")
      .select([
        "movimientoInventario.*",
        "documento.clave",
        "documento.fechaISO",
        "documento.moneda",
        "documento.tipoCambio",
        "producto.name as __productoId",
        "producto.codigo as productoCodigo",
        "producto.impuesto as impuestoUnitarioProducto"
      ])
      .innerJoin("producto", "producto.id", "movimientoInventario.productoId")
      .innerJoin("documento", "documento.id", "movimientoInventario.documentoId")
      .where(
        this.knex.raw(
          "case when documento.documentoAnuladorId or documento.documentoAnuladoDeId then true else false end"
        ),
        "=",
        false
      )
      .whereIn("movimientoInventario.id", movimientosIds)
      .where("movimientoInventario.activo", true);

    if (movimientos.length == 0)
      throw new Errors.VALIDATION_ERROR(
        "Uno de estos movimientos ya fue devuelto, o no se encontraron movimientos aptos para una devolucion"
      );

    var documentoId;

    var movimientosForDevolucion = [];
    movimientos.forEach((movimiento, index) => {
      if (documentoId && movimiento.documentoId != documentoId)
        throw new Errors.VALIDATION_ERROR("Lo movimientos deben ser de la misma factura");
      if (movimiento.tipo != "FA")
        throw new Errors.VALIDATION_ERROR("Lo movimientos solo pueden ser facturas");

      documentoId = movimiento.documentoId;

      var nuevaCantidad = parseFloat(itemMap[movimiento.id].cantidad);
      if (!nuevaCantidad) return;

      if (nuevaCantidad > movimiento.cantidad)
        throw new Errors.VALIDATION_ERROR("La cantidad no puede ser mayor al original.");

      const _subtotal = Dinero({ amount: parseInt(movimiento.precio * 100000) }).multiply(
        nuevaCantidad,
        "HALF_UP"
      );
      const _descuento = _subtotal.percentage(movimiento.descuentoUnitario);
      const _subTotalConDescuento = _subtotal.subtract(_descuento, "HALF_UP");

      const _impuesto = _subTotalConDescuento.percentage(movimiento.impuestoUnitario, "HALF_UP");

      const totalComprobante = _subTotalConDescuento.add(_impuesto, "HALF_UP");

      const codigo = movimiento.codigo || `{"Tipo":"04","Codigo":"${movimiento.productoCodigo}"}`;
      var _excentoUnitario = 0;
      var exoneracion;
      if (movimiento.exoneracion) {
        exoneracion = JSON.parse(movimiento.exoneracion);
        _excentoUnitario = Dinero({ amount: parseInt(movimiento.impuestoUnitarioProducto) * 100000 })
          .percentage(exoneracion.PorcentajeCompra)
          .toRoundedUnit(2);
      }

      var newMovimiento = {
        movimientoInventarioOriginalId: movimiento.id,
        plazo: 90,
        clave: movimiento.clave,
        cantidad: nuevaCantidad,
        fechaISO: movimiento.fechaISO,
        precio: movimiento.precio,
        moneda: movimiento.moneda,
        tipoCambio: movimiento.tipoCambio,
        subTotal: _subtotal.toRoundedUnit(5, "HALF_UP"),
        subTotalConDescuento: _subTotalConDescuento.toRoundedUnit(5, "HALF_UP"),
        impuesto: _impuesto.toRoundedUnit(5, "HALF_UP"),
        excento: _subTotalConDescuento.percentage(_excentoUnitario).toRoundedUnit(5, "HALF_UP"),
        _excentoUnitario: _excentoUnitario,
        descuento: _descuento.toRoundedUnit(5, "HALF_UP"),
        total: totalComprobante.toRoundedUnit(5, "HALF_UP"),
        impuestoUnitario: movimiento.impuestoUnitario,
        descuentoUnitario: movimiento.descuentoUnitario,
        medida: movimiento.medida || (movimiento.mercancia ? "Unid" : "Sp"),
        mercancia: movimiento.mercancia,
        codigo: codigo,
        detalle: movimiento.detalle || movimiento.__productoId,
        productoId: movimiento.productoId,
        tipo: "DE",
        fecha: moment().format("YYYY-MM-DD"),
        numeroLinea: index + 1,
        naturalezaDescuento: movimiento.naturalezaDescuento,
        __productoId: movimiento.__productoId,
        clienteId: movimiento.clienteId,
        documentoId: movimiento.documentoId,
        descripcion: body.descripcion
      };

      if (exoneracion) {
        newMovimiento.exoneracion = JSON.stringify({
          TipoDocumento: exoneracion.TipoDocumento,
          NumeroDocumento: exoneracion.NumeroDocumento,
          NombreInstitucion: exoneracion.NombreInstitucion,
          FechaEmision: moment(exoneracion.FechaEmision).format("YYYY-MM-DDT13:00:00+06:00"),
          MontoImpuesto: _subTotalConDescuento.percentage(_excentoUnitario).toRoundedUnit(5, "HALF_UP"),
          PorcentajeCompra: exoneracion.PorcentajeCompra
        });
      }
      movimientosForDevolucion.push(newMovimiento);
    });

    var boleta = {
      movimientoInventario: movimientosForDevolucion,
      referencia: body.boleta,
      descripcion: body.descripcion,
      tipo: "DE"
    };
    var action = this.getActionInstanceFor("boleta", "create");
    boleta = await action.execute("boleta", boleta);

    await this.knex
      .table("despacho")
      .update({estado: "por anular"})
      .where("documentoId", documentoId)
      .whereNot("estado", "archivado"); 

    await this.knex
      .table("movimientoInventario")
      .update({ activo: false })
      .whereIn("movimientoInventario.id", movimientosIds);

    return boleta;
  }
};


exports.up = function (knex, Promise) {
  return knex.schema.alterTable('gasto', function (table) {
    table.json("archivos");
    table.string("linkRespuesta");
    table.string("linkFactura");
    table.string("consecutivo");
    table.json("emisor");
    table.json("detalleServicio");
    table.json("receptor");
    table.json("resumenFactura");

    table.decimal("subTotalConDescuento", 18, 5);
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.alterTable('gasto', (table) => {
    table.dropColumn("archivos");
    table.dropColumn("linkRespuesta");
    table.dropColumn("linkFactura");
    table.dropColumn("consecutivo");
    table.dropColumn("emisor");
    table.dropColumn("detalleServicio");
    table.dropColumn("receptor");
    table.dropColumn("resumenFactura");
    table.dropColumn("subTotalConDescuento");
  });
};

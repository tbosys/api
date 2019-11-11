exports.up = function (knex, Promise) {
  return knex.schema.createTable('boleta', function (table) {
    table.increments();
    table.string("createdBy");
    table.string("updatedBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.string("namespaceId", 20).notNull();
    table.date("fecha");
    table.string("fechaISO", 51);

    table.string("estado");
    table.string("tipo", 10);
    table.json("movimiento");

    table.text("descripcion");
    table.string("referencia", 15);
    table.json("movimientoInventario");


    table.string("externalId");
    table.string("ownerExternalId");

    table.integer("ownerId").unsigned();
    table.foreign('ownerId').references('id').inTable('usuario').onDelete("RESTRICT");

    table.string("ownerName");

    table.unique(['tipo', 'referencia', 'externalId', 'namespaceId'], "boleta")
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('boleta');
};

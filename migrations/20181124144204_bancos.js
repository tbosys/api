
exports.up = function (knex, Promise) {
  return knex.schema.createTable('bank', function (table) {
    table.increments();
    table.string("name");
    table.string("descripcion");
    table.string('IBAN').unique();
    table.string('cuentaCliente').unique();
    table.string('numero').unique();
    table.string('banco');
    table.decimal('balance', 17, 5).defaultTo(0);

    table.string("createdBy");
    table.string("updatedBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.string("namespaceId", 20).notNull();
    table.integer("ownerId").unsigned();
    table.foreign('ownerId').references('id').inTable('usuario').onDelete("RESTRICT");
    table.string("ownerName");
  })

}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('bank')

};
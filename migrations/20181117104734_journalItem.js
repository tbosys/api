exports.up = function (knex, Promise) {
  return knex.schema.createTable('journalItem', function (table) {
    table.increments();

    table.string("descripcion", 1000);
    table.string('balanceName');
    table.decimal('startingBalance', 17, 2);
    table.decimal('endingBalance', 17, 2);
    table.boolean('isDebit');
    table.integer('uuid');
    table.decimal('debito', 17, 5);
    table.decimal('credito', 17, 5);
    table.string('moneda'); //CRC,USD,EUR
    table.decimal('tipoCambio');
    table.decimal('montoEnMoneda');

    table.string("createdBy");
    table.string("updatedBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.string("namespaceId", 20).notNull();
    table.string("name", 50).notNull();
    table.integer("ownerId").unsigned();
    table.foreign('ownerId').references('id').inTable('usuario').onDelete("RESTRICT");
    table.string("ownerName");

    table.integer('journalId').unsigned();
    table.foreign('journalId').references('journal.id');

    table.integer('accountId').unsigned();
    table.foreign('accountId').references('account.id');

  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('journalItem')
};

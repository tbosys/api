
exports.up = function (knex, Promise) {
  return knex.schema.createTable('registroCuentaContableDetail', function (table) {
    table.increments();

    table.integer('accountId').unsigned();
    table.foreign('accountId').references('account.id');
    table.integer('registroCuentaContableId').unsigned();
    table.foreign('registroCuentaContableId').references('registroCuentaContable.id');
    table.decimal('balance', 17, 5);
    table.decimal('balancePendiente', 17, 5);

    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.string("namespaceId", 20).notNull();


  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('registroCuentaContableDetail')

};

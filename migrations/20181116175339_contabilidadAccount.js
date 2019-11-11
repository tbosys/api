const v1 = require('../triggers/account/v1');

exports.up = function (knex, Promise) {
  return knex.schema.createTable('account', function (table) {
    table.increments();
    table.string("name");
    table.string("detalles");
    table.string('codigo').unique();
    table.string('tipo');
    table.integer('nivel').defaultTo(0);
    table.decimal('balance', 17, 5).defaultTo(0);
    table.boolean('normalDebit').defaultTo(true);
    table.boolean('normalCredit').defaultTo(false);
    table.decimal('balancePendiente', 17, 5).defaultTo(0);
    table.boolean('isFinalChild').defaultTo(false);
    table.integer('accountId').unsigned().nullable();
    table.foreign('accountId').references('account.id');


    table.string("createdBy");
    table.string("updatedBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.string("namespaceId", 20).notNull();
    table.integer("ownerId").unsigned();
    table.foreign('ownerId').references('id').inTable('usuario').onDelete("RESTRICT");
    table.string("ownerName");
  })
    .then(function () {
      return Promise.mapSeries(v1.up, (sql) => knex.schema.raw(sql))
    })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('account')
    .then(function () {
      return Promise.mapSeries(v1.down, (sql) => knex.schema.raw(sql))
    })
};
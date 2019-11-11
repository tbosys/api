exports.up = function (knex, Promise) {
  return knex.schema.alterTable('usuario', function (table) {
    table.integer("nivel").defaultTo(1);
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.alterTable('usuario', (table) => {
    table.dropColumn("nivel");

  });
};

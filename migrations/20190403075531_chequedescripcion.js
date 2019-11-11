exports.up = function(knex, Promise) {
  return knex.schema.alterTable("cheque", function(table) {
    table.string("descripcion");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("cheque", function(table) {
    table.dropColumn("descripcion");
  });
};

exports.up = function(knex, Promise) {
  return knex.schema.alterTable("okr", function(table) {
    table.integer("ownerId").unsigned();
    table
      .foreign("ownerId")
      .references("id")
      .inTable("usuario")
      .onDelete("RESTRICT");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("okr", function(table) {
    table.dropForeign("ownerId");
    table.dropColumn("ownerId");
  });
};

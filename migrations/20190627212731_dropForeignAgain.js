exports.up = function(knex, Promise) {
  return knex.schema.alterTable("project", function(table) {
    table.dropForeign("ownerId");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("project", function(table) {
    table
      .foreign("ownerId")
      .references("id")
      .inTable("owner");
  });
};

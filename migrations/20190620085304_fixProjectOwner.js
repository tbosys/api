exports.up = function(knex, Promise) {
  return knex.schema.alterTable("project", function(table) {
    table.dropForeign("ownerId");
    table
      .foreign("ownerId")
      .references("id")
      .inTable("owner")
      .onDelete("RESTRICT");
  });
};

exports.down = function(knex, Promise) {
  return Promise.resolve({});
};

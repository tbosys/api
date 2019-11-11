exports.up = function(knex, Promise) {
  return knex.schema
    .createTable("tag", function(table) {
      table.increments();
      table.timestamp("createdAt").defaultTo(knex.fn.now());
      table.string("name");
      table.string("descripcion");
    })
    .then(() => {
      return knex.schema.alterTable("cliente", function(table) {
        table.string("tags");
      });
    });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("tag").then(() => {
    return knex.schema.alterTable("cliente", function(table) {
      table.dropColumn("tags");
    });
  });
};

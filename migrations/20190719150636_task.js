exports.up = function(knex, Promise) {
  return knex.schema.createTable("task", function(table) {
    table.increments();

    table.string("accountTypeId");

    table.integer("createdById");
    table.string("createdBy");
    table.string("estado");
    table.string("type");
    table.string("description", 1000);
    table.date("fechaVencimiento");
    table.string("comentarios", 1000);

    table.boolean("isSection");
    table.string("name", 1000);
    table.string("attachment");
    table.integer("order");

    table.timestamp("createdAt").defaultTo(knex.fn.now());

    table.integer("ownerId").unsigned();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("task");
};

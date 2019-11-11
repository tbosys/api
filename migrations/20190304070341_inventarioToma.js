exports.up = function(knex, Promise) {
  return knex.schema.createTable("inventarioToma", function(table) {
    table.increments();
    table.string("createdBy");
    table.string("updatedBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.decimal("inventario", 18, 5).notNull();
    table.decimal("toma", 18, 5).notNull();

    table.integer("productoId").unsigned();
    table.boolean("ok");
    table
      .foreign("productoId")
      .references("id")
      .inTable("producto")
      .onDelete("RESTRICT");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("inventarioToma");
};

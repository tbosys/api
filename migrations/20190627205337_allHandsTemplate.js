exports.up = function(knex, Promise) {
  return knex.schema.createTable("allHandsTemplate", function(table) {
    table.increments();
    table.string("createdBy");
    table.string("descripcion");
    table.json("checklist");

    table.timestamp("createdAt").defaultTo(knex.fn.now());
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("allHandsTemplate");
};

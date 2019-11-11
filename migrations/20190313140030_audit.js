exports.up = function(knex, Promise) {
  return knex.schema.createTable("audit", function(table) {
    table.increments();
    table.integer("metadataId");
    table.string("metadata");
    table.string("action");
    table.json("delta");
    table.string("keys");
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.string("updatedBy");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("audit");
};

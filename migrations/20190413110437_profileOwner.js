exports.up = function(knex, Promise) {
  return knex.schema.createTable("profileOwner", function(table) {
    table.increments();
    table.integer("ownerId").unsigned();
    table.integer("profileId").unsigned();
    table.string("createdBy");
    table.string("updatedBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("profileOwner");
};

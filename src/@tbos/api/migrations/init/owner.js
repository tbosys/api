exports.up = function(knex, Promise) {
  return knex.schema.createTable("owner", function(table) {
    table.increments();
    table.boolean("active").defaultTo(true);
    table.string("name").notNullable();
    table
      .string("email")
      .notNullable()
      .unique();
    table.string("avatar");
    table.string("shareLevel");
    table.string("createdBy");
    table.string("updatedBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("owner");
};

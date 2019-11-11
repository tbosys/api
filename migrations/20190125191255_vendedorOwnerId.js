var env = process.env.NODE_ENV || "development";

exports.up = function(knex, Promise) {
  return knex.schema
    .alterTable("vendedor", function(table) {
      table.integer("ownerId").unique();
      table.dropColumn("externalId");
    })
    .then(async function() {
      return knex.table("vendedor").update({
        ownerId: knex.raw("??", "usuarioId")
      });
    });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("vendedor", function(table) {
    table.dropColumn("ownerId");
    table.integer("externalId");
  });
};

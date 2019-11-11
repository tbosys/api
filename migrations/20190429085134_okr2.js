exports.up = function(knex, Promise) {
  return knex.schema.alterTable("okr", function(table) {
    table.integer("okrId").unsigned();
    table.foreign("okrId").references("okr.id");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("okr", function(table) {
    table.dropForeign("okrId");
    table.dropColumn("okrId");
  });
};

exports.up = function(knex, Promise) {
  return knex.schema.alterTable("emailRecord", function(table) {
    table.string("emailId");
    table.string("campaingId");
    table.string("estado");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("emailRecord", function(table) {
    table.dropColumn("emailId");
    table.dropColumn("estado");
    table.dropColumn("campaingId");
  });
};

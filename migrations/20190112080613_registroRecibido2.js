exports.up = function(knex, Promise) {
  return knex.schema.alterTable("registroRecibido", function(table) {
    table.json("parsedXmls");
    table.json("attachments");
    table.json("validate");
    table.json("emisor");
    table.json("receptor");
    table.string("emailIds");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("registroRecibido", function(table) {
    table.dropColumn("parsedXmls");
    table.dropColumn("attachments");
    table.dropColumn("validate");
    table.dropColumn("emisor");
    table.dropColumn("receptor");
    table.dropColumn("emailIds");
  });
};

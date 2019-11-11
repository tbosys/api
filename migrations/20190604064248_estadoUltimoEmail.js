exports.up = function(knex, Promise) {
  return knex.schema.alterTable("contacto", function(table) {
    table.string("estadoUltimoEmail");
    table.string("ultimoEmail");
    table.string("fechaUltimoEmail");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("contacto", function(table) {
    table.dropColumn("estadoUltimoEmail");
    table.dropColumn("ultimoEmail");
    table.dropColumn("fechaUltimoEmail");
  });
};

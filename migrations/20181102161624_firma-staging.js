exports.up = function (knex, Promise) {
  return knex.schema.alterTable('firmaDigital', function (table) {
    table.string("username_staging");
    table.string("password_staging");
    table.string("pin_staging");
    table.text("certificado_staging", "longtext");
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.alterTable('firmaDigital', (table) => {
    table.dropColumn("username_staging");
    table.dropColumn("password_staging");
    table.dropColumn("pin_staging");
    table.dropColumn("certificado_staging");
  });
};

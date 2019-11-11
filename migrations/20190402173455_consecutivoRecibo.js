exports.up = function(knex, Promise) {
  return knex.schema
    .alterTable("consecutivo", function(table) {
      table.integer("consecutivoRecibo");
    })
    .then(() => {
      return knex.table("consecutivo").update({ consecutivoRecibo: 999999 });
    });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("consecutivo", function(table) {
    table.dropColumn("consecutivoRecibo");
  });
};

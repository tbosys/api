exports.up = function(knex, Promise) {
  return knex.schema.alterTable("gasto", function(table) {
    //table.unique(["clave"]);

    table.dropUnique(["referencia", "tipo", "proveedorId", "namespaceId"], "fcxp");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("gasto", table => {
    //table.unique(["referencia", "tipo", "proveedorId", "namespaceId"], "fcxp");
    //table.dropUnique(["clave"]);
  });
};

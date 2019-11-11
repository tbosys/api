exports.up = function(knex, Promise) {
  return knex.schema
    .alterTable("contacto", function(table) {
      table.date("fechaNacimiento");
      table.string("intereses");
      table.string("photo");
      table.date("fechaIngreso");
      table.string("puesto");
      table.string("tags");
      table.boolean("propietario");
      table.boolean("marcas");
    })
    .then(async () => {
      var clientes = await knex.table("cliente").where("tags", "!=", "");
      var tagsByCliente = {};
      clientes.forEach(cliente => {
        if (!tagsByCliente[cliente.id]) tagsByCliente[cliente.id] = { id: cliente.id, tags: "" };
        tagsByCliente[cliente.id].tags = cliente.tags;
      });
      var values = Object.values(tagsByCliente);
      var count = values.length - 1;
      while (count > -1) {
        var cliente = values[count];
        await knex
          .table("contacto")
          .update({ tags: tagsByCliente[cliente.id].tags || "'" })
          .where("clienteId", cliente.id);
        count--;
      }
      return true;
    });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("contacto", function(table) {
    table.dropColumn("fechaNacimiento");
    table.dropColumn("intereses");
    table.dropColumn("photo");
    table.dropColumn("fechaIngreso");
    table.dropColumn("puesto");
    table.dropColumn("propietario");
    table.dropColumn("marcas");
    table.dropColumn("tags");
  });
};

exports.up = function(knex, Promise) {
  return knex.schema
    .createTable("productoDepartamento", function(table) {
      table.increments();
      table.string("createdBy");
      table.string("updatedBy");

      table.timestamp("createdAt").defaultTo(knex.fn.now());
      table.timestamp("updatedAt").defaultTo(knex.fn.now());
      table.string("name");
      table.string("description");
      table.string("photoUrl");
    })
    .then(async () => {
      try {
        var departamentos = [];
        var productos = await knex.table("producto").select();
        productos.forEach(producto => {
          if (departamentos.indexOf(producto.categoriaName) == -1) departamentos.push(producto.categoriaName);
        });

        var promises = departamentos.map(departamento => {
          if (departamento && departamento.length > 0)
            return knex.table("productoDepartamento").insert({
              name: departamento,
              photoUrl: "https://uploads.efactura.io/3101032175/basePhoto.jpg"
            });
          return Promise.resolve({});
        });
        return Promise.all(promises);
      } catch (e) {
        console.log(e);
        return true;
      }
    });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("productoDepartamento");
};

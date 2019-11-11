exports.up = function(knex, Promise) {
  return knex.schema
    .createTableIfNotExists("productoCategoria", function(table) {
      table.increments();
      table.string("createdBy");
      table.string("updatedBy");

      table.timestamp("createdAt").defaultTo(knex.fn.now());
      table.timestamp("updatedAt").defaultTo(knex.fn.now());
      table.string("name");
      table.string("description");
      table.string("photoUrl");
      table.integer("productoDepartamentoId").unsigned();
      table
        .foreign("productoDepartamentoId")
        .references("id")
        .inTable("productoDepartamento")
        .onDelete("RESTRICT");
    })
    .then(async () => {
      try {
        var departamentos = await knex.table("productoDepartamento").select();
        var departamanentoMap = {};
        var categorias = {};

        departamentos.forEach(departamento => {
          departamanentoMap[departamento.name] = departamento.id;
        });

        var productos = await knex.table("producto").select();
        productos.forEach(producto => {
          if (producto.categoriaName && producto.categoriaNam != "")
            categorias[`${producto.categoriaName}_${producto.atributoGeneral}`] =
              departamanentoMap[producto.categoriaName];
        });

        var promises = Object.keys(categorias).map(categoriaKey => {
          var name = categoriaKey.split("_")[1];
          if (name)
            return knex.table("productoCategoria").insert({
              name: categoriaKey.split("_")[1],
              productoDepartamentoId: categorias[categoriaKey],
              photoUrl: "https://uploads.efactura.io/3101032175/basePhoto.jpg"
            });
          else return Promise.resolve({});
        });

        return await Promise.all(promises);
      } catch (e) {
        console.log(e);
        return true;
      }
    });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("productoCategoria");
};

exports.up = function(knex, Promise) {
  return knex.schema
    .createTable("productoGrupo", function(table) {
      table.increments();
      table.string("createdBy");
      table.string("updatedBy");

      table.timestamp("createdAt").defaultTo(knex.fn.now());
      table.timestamp("updatedAt").defaultTo(knex.fn.now());
      table.string("name");
      table.string("description");
      table.string("photoUrl");

      table.integer("productoCategoriaId").unsigned();
      table
        .foreign("productoCategoriaId")
        .references("id")
        .inTable("productoCategoria")
        .onDelete("RESTRICT");
    })
    .then(async () => {
      try {
        var categorias = await knex
          .table("productoCategoria")
          .select(["productoCategoria.*", "productoDepartamento.name as departamentoName"])
          .innerJoin(
            "productoDepartamento",
            "productoDepartamento.id",
            "productoCategoria.productoDepartamentoId"
          );
        var departmanentoMap = {};

        categorias.forEach(categoria => {
          departmanentoMap[categoria.departamentoName + "_" + categoria.name] = categoria.id;
        });

        let grupos = {};
        var productos = await knex.table("producto").select();
        productos.forEach(producto => {
          if (departmanentoMap[`${producto.categoriaName}_${producto.atributoGeneral}`])
            grupos[`${producto.categoriaName}_${producto.atributoGeneral}_${producto.atributoSubCategoria}`] =
              departmanentoMap[`${producto.categoriaName}_${producto.atributoGeneral}`].id;
        });

        var promises = Object.keys(grupos).map(grupoKey => {
          var parts = grupoKey.split("_");
          if (departmanentoMap[`${parts[0]}_${parts[1]}`] && parts[2].length > 0)
            return knex.table("productoGrupo").insert({
              name: parts[2],
              productoCategoriaId: departmanentoMap[`${parts[0]}_${parts[1]}`],
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
  return knex.schema.dropTable("productoGrupo");
};

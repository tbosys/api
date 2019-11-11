exports.up = function(knex, Promise) {
  return knex.schema
    .createTable("productoGrupoList", function(table) {
      table.increments();
      table.string("createdBy");
      table.string("updatedBy");

      table.timestamp("createdAt").defaultTo(knex.fn.now());
      table.timestamp("updatedAt").defaultTo(knex.fn.now());

      table.integer("productoId").unsigned();
      table
        .foreign("productoId")
        .references("id")
        .inTable("producto")
        .onDelete("RESTRICT");

      table.integer("productoGrupoId").unsigned();
      table
        .foreign("productoGrupoId")
        .references("id")
        .inTable("productoGrupo")
        .onDelete("RESTRICT");
    })
    .then(async () => {
      try {
        var categorias = await knex
          .table("productoGrupo")
          .select([
            "productoGrupo.*",
            "productoCategoria.name as productoCategoriaName",
            "productoDepartamento.name as departamentoName"
          ])
          .innerJoin("productoCategoria", "productoCategoria.id", "productoGrupo.productoCategoriaId")

          .innerJoin(
            "productoDepartamento",
            "productoDepartamento.id",
            "productoCategoria.productoDepartamentoId"
          );
        var departmanentoMap = {};

        categorias.forEach(categoria => {
          departmanentoMap[
            categoria.departamentoName + "_" + categoria.productoCategoriaName + "_" + categoria.name
          ] = categoria.id;
        });

        let grupos = {};
        var productos = await knex.table("producto").select();
        productos.forEach(producto => {
          var list =
            grupos[
              `${producto.categoriaName}_${producto.atributoGeneral}_${producto.atributoSubCategoria}`
            ] || [];
          list.push(producto.id);
          grupos[
            `${producto.categoriaName}_${producto.atributoGeneral}_${producto.atributoSubCategoria}`
          ] = list;
        });
        var promises = [];
        Object.keys(grupos).forEach(grupoKey => {
          var parts = grupoKey.split("_");
          if (departmanentoMap[grupoKey])
            grupos[grupoKey].forEach(listItem => {
              promises.push(
                knex.table("productoGrupoList").insert({
                  productoId: listItem,
                  productoGrupoId: departmanentoMap[grupoKey]
                })
              );
            });
          else Promise.resolve({});
        });
        return await Promise.all(promises);
      } catch (e) {
        console.log(e);
        return true;
      }
    });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("productoGrupoList");
};

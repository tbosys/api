exports.up = function(knex, Promise) {
  return knex.schema
    .alterTable("precio", function(table) {
      table.integer("grupoId").unsigned();
      table
        .foreign("grupoId")
        .references("id")
        .inTable("grupo")
        .onDelete("RESTRICT");
    })
    .then(async () => {
      var grupos = await knex.table("grupo").select();
      var gruposMap = {};
      grupos.forEach(grupo => {
        gruposMap[grupo.name] = grupo.id;
      });
      var precios = knex.table("precio").select();
      var promises = precios.map(precio => {
        precio.grupoId = gruposMap[precio.name];
        if (precio.grupoId)
          return knex
            .table("precio")
            .update({ grupoId: precio.grupoId })
            .where("id", precio.id);
        return Promise.resolve({});
      });

      return Promise.all(promises);
    })
    .then(async () => {
      var retail = await knex
        .table("grupo")
        .select()
        .where("name", "retail")
        .first();
      if (retail) return;

      await knex
        .table("grupo")
        .update({ name: "retail" })
        .where("name", "General");

      return true;
    });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("precio", function(table) {
    table.dropForeign("grupoId");
    table.dropColumn("grupoId");
  });
};

exports.up = function(knex, Promise) {
  return knex.schema
    .createTable("clienteGrupo", function(table) {
      table.increments();
      table.string("createdBy");
      table.string("updatedBy");

      table.timestamp("createdAt").defaultTo(knex.fn.now());
      table.timestamp("updatedAt").defaultTo(knex.fn.now());

      table.integer("clienteId").unsigned();
      table
        .foreign("clienteId")
        .references("id")
        .inTable("cliente")
        .onDelete("RESTRICT");

      table.integer("grupoId").unsigned();
      table
        .foreign("grupoId")
        .references("id")
        .inTable("grupo")
        .onDelete("RESTRICT");
    })
    .then(async () => {
      var clientes = await knex.table("cliente").select();
      var promises = clientes.map(cliente => {
        if (!cliente.grupoId) return Promise.resolve({});
        return knex.table("clienteGrupo").insert({
          clienteId: cliente.id,
          grupoId: cliente.grupoId
        });
      });

      return Promise.all(promises);
    });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("clienteGrupo");
};

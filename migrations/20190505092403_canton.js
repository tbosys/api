exports.up = function(knex, Promise) {
  return knex.schema
    .createTable("canton", function(table) {
      table.increments();
      table.string("name").notNull();
      table.string("code").notNull();
      table.string("provincia").notNull();
      table.decimal("poblacion", 18, 2);
      table.decimal("m2Construccion", 18, 2);
      table.decimal("IndiceDesarrolloHumano", 18, 2);
      table.decimal("promedioVentasDirectas", 18, 2);
      table.decimal("promedioVentasIndirectas", 18, 2);
    })
    .then(() => {
      return knex.schema.alterTable("distrito", function(table) {
        table.integer("cantonId").unsigned();
        table
          .foreign("cantonId")
          .references("id")
          .inTable("canton")
          .onDelete("RESTRICT");
      });
    });
};

exports.down = function(knex, Promise) {
  return knex.schema
    .alterTable("distrito", function(table) {
      table.dropForeign("cantonId");
      table.dropColumn("cantonId");
    })
    .then(() => {
      return knex.schema.dropTable("canton").then(() => {});
    });
};

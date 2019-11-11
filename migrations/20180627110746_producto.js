const v1 = require('../triggers/producto/v1');


exports.up = function (knex, Promise) {
  return knex.schema.createTable('producto', function (table) {
    table.increments();
    table.string("createdBy");
    table.string("updatedBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.string("namespaceId", 20).notNull();

    table.string("name", 170).notNull();
    table.boolean("activo");

    table.decimal("inventario", 18, 5);
    table.decimal("precio", 18, 5);

    table.text("descripcion");
    table.boolean("mercancia").defaultTo(true);
    table.boolean("primario").defaultTo(false);
    table.string("unidadMedida");
    table.string("familia");
    table.string("subFamilia");
    table.string("codigo");
    table.string("marca");
    table.string("grupo");
    table.string("presentacion");
    table.string("categoria");
    table.string("atributoCategoria");
    table.string("atributoSubCategoria");
    table.string("atributoGeneral");
    table.string("atributoPrincipal");

    table.integer("impuesto");

    table.string("externalId");
    table.string("ownerExternalId");
    table.string("categoriaName");

    table.integer("categoriaId").unsigned();
    table.foreign('categoriaId').references('id').inTable('categoria').onDelete("RESTRICT");

    table.integer("ownerId").unsigned();
    table.foreign('ownerId').references('id').inTable('usuario').onDelete("RESTRICT");

    table.string("ownerName");

    table.unique(['name', 'externalId', 'namespaceId'], "producto")

  }).then(function () {
    return Promise.mapSeries(v1.up, (sql) => knex.schema.raw(sql))
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('producto');
};

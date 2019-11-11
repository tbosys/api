exports.up = function(knex, Promise) {
  return knex.schema
    .alterTable("segmento", function(table) {
      table.dropForeign("ownerId");
    })
    .then(function() {
      return knex.schema.alterTable("grupo", function(table) {
        table.dropForeign("ownerId");
      });
    })
    .then(function() {
      return knex.schema.alterTable("zona", function(table) {
        table.dropForeign("ownerId");
      });
    })
    .then(function() {
      return knex.schema.alterTable("transporte", function(table) {
        table.dropForeign("ownerId");
      });
    })
    .then(function() {
      return knex.schema.alterTable("transporteContacto", function(table) {
        table.dropForeign("ownerId");
      });
    })
    .then(function() {
      return knex.schema.alterTable("cliente", function(table) {
        table.dropForeign("ownerId");
      });
    })
    .then(function() {
      return knex.schema.alterTable("categoria", function(table) {
        table.dropForeign("ownerId");
      });
    })
    .then(function() {
      return knex.schema.alterTable("producto", function(table) {
        table.dropForeign("ownerId");
      });
    })
    .then(function() {
      return knex.schema.alterTable("contacto", function(table) {
        table.dropForeign("ownerId");
      });
    })
    .then(function() {
      return knex.schema.alterTable("proveedor", function(table) {
        table.dropForeign("ownerId");
      });
    })
    .then(function() {
      return knex.schema.alterTable("facturaCxP", function(table) {
        table.dropForeign("ownerId");
      });
    })
    .then(function() {
      return knex.schema.alterTable("pagoCxP", function(table) {
        table.dropForeign("ownerId");
      });
    })
    .then(function() {
      return knex.schema.alterTable("lineaPagoCxP", function(table) {
        table.dropForeign("ownerId");
      });
    })
    .then(function() {
      return knex.schema.alterTable("orden", function(table) {
        table.dropForeign("ownerId");
      });
    })
    .then(function() {
      return knex.schema.alterTable("ordenLinea", function(table) {
        table.dropForeign("ownerId");
      });
    })
    .then(function() {
      return knex.schema.alterTable("documento", function(table) {
        table.dropForeign("ownerId");
      });
    })
    .then(function() {
      return knex.schema.alterTable("boleta", function(table) {
        table.dropForeign("ownerId");
      });
    })
    .then(function() {
      return knex.schema.alterTable("movimientoInventario", function(table) {
        table.dropForeign("ownerId");
      });
    })
    .then(function() {
      return knex.schema.alterTable("envio", function(table) {
        table.dropForeign("ownerId");
      });
    })
    .then(function() {
      return knex.schema.alterTable("listaEmpaque", function(table) {
        table.dropForeign("ownerId");
      });
    })
    .then(function() {
      return knex.schema.alterTable("pagoDocumento", function(table) {
        table.dropForeign("ownerId");
      });
    })
    .then(function() {
      return knex.schema.alterTable("lineaPagoDocumento", function(table) {
        table.dropForeign("ownerId");
      });
    })
    .then(function() {
      return knex.schema.alterTable("registro", function(table) {
        table.dropForeign("ownerId");
      });
    })
    .then(function() {
      return knex.schema.alterTable("cierre", function(table) {
        table.dropForeign("ownerId");
      });
    })
    .then(function() {
      return knex.schema.alterTable("evento", function(table) {
        table.dropForeign("ownerId");
      });
    })
    .then(function() {
      return knex.schema.alterTable("meta", function(table) {
        table.dropForeign("ownerId");
      });
    })
    .then(function() {
      return knex.schema.alterTable("saldo", function(table) {
        table.dropForeign("ownerId");
      });
    })
    .then(function() {
      return knex.schema.alterTable("account", function(table) {
        table.dropForeign("ownerId");
      });
    })
    .then(function() {
      return knex.schema.alterTable("journal", function(table) {
        table.dropForeign("ownerId");
      });
    })
    .then(function() {
      return knex.schema.alterTable("journalItem", function(table) {
        table.dropForeign("ownerId");
      });
    })
    .then(function() {
      return knex.schema.alterTable("bank", function(table) {
        table.dropForeign("ownerId");
      });
    })
    .then(function() {
      return knex.schema.alterTable("despacho", function(table) {
        table.dropForeign("ownerId");
      });
    })
    .then(function() {
      return knex.schema.alterTable("comisionHistorico", function(table) {
        table.dropForeign("ownerId");
      });
    })
    .then(function() {
      return knex.schema.alterTable("proveedorContacto", function(table) {
        table.dropForeign("ownerId");
      });
    });
};

exports.down = function(knex, Promise) {
  return Promise.resolve({});
};

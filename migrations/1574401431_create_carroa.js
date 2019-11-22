
'use strict'

exports.up = function (knex, Promise) {
  return knex.schema.createTable('carroa', function (table) {
    
    table.increments();
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.string("createdById");
    table.string("updatedById");
    table.string("ownerId");
    //auto fields
    table.string('color', undefined}) 
 table.string('modelo', undefined}) 
 table.integer('ano', undefined).defaultTo(2000)

  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('carroa')
};

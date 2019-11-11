exports.up = function (knex, Promise) {
  return knex.schema.dropTableIfExists('clienteCorreoFe')
};

exports.down = function (knex, Promise) {
  return Promise.resolve({});
};
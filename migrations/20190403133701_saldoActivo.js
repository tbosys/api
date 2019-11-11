exports.up = function(knex, Promise) {
  return knex.table("saldo").update({ activo: true });
};

exports.down = function(knex, Promise) {
  return Promise.resolve();
};

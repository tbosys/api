const v1 = require("../triggers/saldo/v1");

exports.up = function(knex, Promise) {
  return Promise.mapSeries(v1.up, sql => knex.schema.raw(sql));
};

exports.down = function(knex, Promise) {
  return Promise.mapSeries(v1.down, sql => knex.schema.raw(sql));
};

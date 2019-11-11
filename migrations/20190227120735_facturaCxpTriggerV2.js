const v2 = require("../triggers/facturaCxP/v2");

const Promise = require("bluebird");

exports.up = function(knex, Promise) {
  return Promise.mapSeries(v2.up, sql => knex.schema.raw(sql));
};

exports.down = function(knex, Promise) {
  return Promise.mapSeries(v2.down, sql => knex.schema.raw(sql));
};

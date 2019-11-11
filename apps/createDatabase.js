var exec = require("child-process-promise").exec;

module.exports.app = async event => {
  var body = event;
  try {
    body = JSON.parse(event);
  } catch (e) {}
  console.log(body);
  var knexFile = require("../knexfile");
  var env = process.env.NODE_ENV || "development";
  var knexAuth = knexFile[env];
  knexAuth.connection.database = "positiveion";
  var knex = require("knex")(knexAuth);
  await knex.raw(`CREATE DATABASE ${body.account};`);

  knexAuth.connection.database = body.account;
  var knexMigrate = require("knex")(knexAuth);

  await knexMigrate.migrate.latest();
  await knexMigrate.seed.run();

  await knex.destroy();
  await knexMigrate.destroy();

  return true;
};

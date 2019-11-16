const moment = require("moment");
//const distritos = require("../_seeds/distrito");

function insertIgnore(knex, operation) {
  return knex.raw(operation.toString().replace(/^insert/i, "insert ignore"));
}

exports.seed = async function(knex, Promise) {
  if (process.env.NODE_ENV == "development") {
    await insertIgnore(
      knex,
      knex("owner").insert({ id: 100, email: "dev@dev", name: "Dev Dev" })
    );
    await insertIgnore(
      knex,
      knex("profile").insert({
        id: 100,
        roles: "*_*",
        name: "admin"
      })
    );
    await insertIgnore(
      knex,
      knex("profileOwner").insert({ id: 100, profileId: 100, ownerId: 100 })
    );
  } else
    await insertIgnore(
      knex,
      knex("owner").insert({ id: 1, email: "", name: "System Account" })
    );
};

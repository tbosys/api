exports.up = function (knex, Promise) {
  return knex.schema.alterTable('log', function (table) {
    table.decimal("remainingTimeInMillis");
    table.string("functionName");
    table.string("logGroupName");
    table.string("logStreamName");
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.alterTable('log', (table) => {
    table.dropColumn("remainingTimeInMillis");
    table.dropColumn("functionName");
    table.dropColumn("logGroupName");
    table.dropColumn("logStreamName");
  });
};

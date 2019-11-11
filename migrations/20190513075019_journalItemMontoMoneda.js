exports.up = async function (knex, Promise) {
    await knex.schema.alterTable('journalItem', function (table) {
      table.decimal("montoEnMoneda", 18, 5).alter();
      table.decimal("startingBalance", 18, 5).alter();
      table.decimal("endingBalance", 18, 5).alter();
    })
  };
  
  exports.down = function (knex, Promise) {
    return knex.schema.alterTable('journalItem', (table) => {
    });
  };
  
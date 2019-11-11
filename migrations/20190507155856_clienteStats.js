exports.up = function(knex, Promise) {
  return knex.schema.createTable("clienteStats", function(table) {
    table.increments();

    table.date("fecha", 30);
    table.string("YYYY-MM", 10);
    table.decimal("promedioCompra", 18, 5);
    table.integer("promedioCompraDelta");
    table.decimal("promedioCompraPotencial", 18, 5);
    table.decimal("promedioCompraG1", 18, 5);
    table.integer("promedioCompraG1Delta", 18, 5);
    table.decimal("promedioCompraG1Potencial", 18, 5);
    table.decimal("promedioCompraG2", 18, 5);
    table.integer("promedioCompraG2Delta", 18, 5);
    table.decimal("promedioCompraG2Potencial", 18, 5);
    table.decimal("promedioCompraG3", 18, 5);
    table.integer("promedioCompraG3Delta", 18, 5);
    table.decimal("promedioCompraG3Potencial", 18, 5);

    table.integer("indicePagosDigitales");
    table.integer("indicePagosDigitalesDelta");

    table.integer("promedioPagoDias");
    table.integer("promedioPagoDiasDelta");
    table.decimal("promedioPagoMonto", 18, 5);
    table.integer("promedioPagoMontoDelta");
    table.decimal("saldo", 18, 5);
    table.integer("saldoDelta");
    table.decimal("promedioSaldoDias", 18, 5);
    table.integer("promedioSaldoDiasDelta");

    table.integer("conteoVisitas");
    table.integer("conteoLlamadas");
    table.integer("conteoEmails");
    table.date("ultimoContacto");

    table.integer("clienteId").unsigned();
    table
      .foreign("clienteId")
      .references("id")
      .inTable("cliente")
      .onDelete("RESTRICT");

    table.unique(["clienteId", "YYYY-MM"]);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("clienteStats");
};

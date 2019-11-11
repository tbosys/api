var triggerBody = `if (new.total < 0 and new.tipo = 'FA')        then             signal sqlstate '45000' set message_text = 'El saldo de la factura resulto menor que 0';    
ELSEIF (new.total > 0 and new.tipo = 'NC')       then             signal sqlstate '45000' set message_text = 'El saldo de la Nota de Credito resulto menor a 0';    
ELSEIF (new.total < 0 and new.tipo = 'ND')        then             signal sqlstate '45000' set message_text = 'El saldo de la Nota de Debito resulto menor a 0';    
end if;`;

module.exports.up = [
  "DROP TRIGGER IF EXISTS saldoInsert;",
  "DROP TRIGGER IF EXISTS saldoUpdate;",
  `CREATE TRIGGER saldoInsert BEFORE INSERT ON saldo FOR EACH ROW ${triggerBody};`,
  `CREATE TRIGGER saldoUpdate AFTER UPDATE ON saldo FOR EACH ROW ${triggerBody};`
];

module.exports.down = ["DROP TRIGGER IF EXISTS saldoInsert;", "DROP TRIGGER IF EXISTS saldoUpdate;"];

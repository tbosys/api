module.exports.up = [
    'DROP TRIGGER IF EXISTS facturaCxPSaldoInsert;',
    'DROP TRIGGER IF EXISTS facturaCxPSaldoUpdate;',
    "CREATE TRIGGER facturaCxPSaldoInsert BEFORE INSERT ON facturaCxP FOR EACH ROW if new.saldo < 0         then             signal sqlstate '45000' set message_text = 'el saldo de la factura no puede ser menor que 0';         end if;",
    "CREATE TRIGGER facturaCxPSaldoUpdate AFTER UPDATE ON facturaCxP FOR EACH ROW if new.saldo < 0         then             signal sqlstate '45000' set message_text = 'el saldo de la factura no puede ser menor que 0';         end if;",
]

module.exports.down = ['DROP TRIGGER IF EXISTS facturaCxPSaldoInsert;', 'DROP TRIGGER IF EXISTS facturaCxPSaldoUpdate;'];

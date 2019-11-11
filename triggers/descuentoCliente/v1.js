module.exports.up = [
    'DROP TRIGGER IF EXISTS descuentoClienteInsert;',
    'DROP TRIGGER IF EXISTS descuentoClienteUpdate;',
    "CREATE TRIGGER descuentoClienteInsert BEFORE INSERT ON descuentoCliente FOR EACH ROW if new.descuento < 0         then             signal sqlstate '45000' set message_text = 'el descuento  no puede ser menor que 0';         end if;",
    "CREATE TRIGGER descuentoClienteUpdate AFTER UPDATE ON descuentoCliente FOR EACH ROW if new.descuento < 0         then             signal sqlstate '45000' set message_text = 'el descuento  no puede ser menor que 0';         end if;",
]

module.exports.down = ['DROP TRIGGER IF EXISTS descuentoClienteInsert;', 'DROP TRIGGER IF EXISTS descuentoClienteUpdate;'];

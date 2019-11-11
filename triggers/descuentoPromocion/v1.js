module.exports.up = [
    'DROP TRIGGER IF EXISTS descuentoPromocionInsert;',
    'DROP TRIGGER IF EXISTS descuentoPromocionUpdate;',
    "CREATE TRIGGER descuentoPromocionInsert BEFORE INSERT ON descuentoPromocion FOR EACH ROW if new.descuento < 0         then             signal sqlstate '45000' set message_text = 'el descuento  no puede ser menor que 0';         end if;",
    "CREATE TRIGGER descuentoPromocionUpdate AFTER UPDATE ON descuentoPromocion FOR EACH ROW if new.descuento < 0         then             signal sqlstate '45000' set message_text = 'el descuento  no puede ser menor que 0';         end if;",
]

module.exports.down = ['DROP TRIGGER IF EXISTS descuentoPromocionInsert;', 'DROP TRIGGER IF EXISTS descuentoPromocionUpdate;'];

module.exports.up = [
    'DROP TRIGGER IF EXISTS precioValorInsert;',
    'DROP TRIGGER IF EXISTS precioValorUpdate;',
    "CREATE TRIGGER precioValorInsert BEFORE INSERT ON precio FOR EACH ROW if new.precio < 0         then             signal sqlstate '45000' set message_text = 'el precio  no puede ser menor que 0';         end if;",
    "CREATE TRIGGER precioValorUpdate AFTER UPDATE ON precio FOR EACH ROW if new.precio < 0         then             signal sqlstate '45000' set message_text = 'el precio  no puede ser menor que 0';         end if;",
]

module.exports.down = ['DROP TRIGGER IF EXISTS precioValorInsert;', 'DROP TRIGGER IF EXISTS precioValorUpdate;'];

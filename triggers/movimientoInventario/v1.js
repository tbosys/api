module.exports.up = [
    'DROP TRIGGER IF EXISTS movimientoInventarioInsert;',
    'DROP TRIGGER IF EXISTS movimientoInventarioUpdate;',
    "CREATE TRIGGER movimientoInventarioInsert BEFORE INSERT ON movimientoInventario FOR EACH ROW if new.cantidad <= 0         then             signal sqlstate '45000' set message_text = 'la cantidad  no puede ser menor que 0';         end if;",
    "CREATE TRIGGER movimientoInventarioUpdate AFTER UPDATE ON movimientoInventario FOR EACH ROW if new.cantidad <= 0         then             signal sqlstate '45000' set message_text = 'la cantidad  no puede ser menor que 0';         end if;",
]

module.exports.down = ['DROP TRIGGER IF EXISTS movimientoInventarioInsert;', 'DROP TRIGGER IF EXISTS movimientoInventarioUpdate;'];

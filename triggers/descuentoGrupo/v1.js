module.exports.up = [
    'DROP TRIGGER IF EXISTS descuentoGrupoInsert;',
    'DROP TRIGGER IF EXISTS descuentoGrupoUpdate;',
    "CREATE TRIGGER descuentoGrupoInsert BEFORE INSERT ON descuentoGrupo FOR EACH ROW if new.descuento < 0         then             signal sqlstate '45000' set message_text = 'el descuento  no puede ser menor que 0';         end if;",
    "CREATE TRIGGER descuentoGrupoUpdate AFTER UPDATE ON descuentoGrupo FOR EACH ROW if new.descuento < 0         then             signal sqlstate '45000' set message_text = 'el descuento  no puede ser menor que 0';         end if;",
]

module.exports.down = ['DROP TRIGGER IF EXISTS descuentoGrupoInsert;', 'DROP TRIGGER IF EXISTS descuentoGrupoUpdate;'];

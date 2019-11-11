module.exports.up = [
  'DROP TRIGGER IF EXISTS productoInventarioInsert;',
  'DROP TRIGGER IF EXISTS productoInventarioUpdate;',
  "CREATE TRIGGER productoInventarioInsert BEFORE INSERT ON producto FOR EACH ROW if new.inventario < 0         then             signal sqlstate '45000' set message_text = 'el inventario del producto no puede ser menor que 0';         end if;",
  "CREATE TRIGGER productoInventarioUpdate AFTER UPDATE ON producto FOR EACH ROW if new.inventario < 0         then             signal sqlstate '45000' set message_text = 'el inventario del producto no puede ser menor que 0';         end if;",
]

module.exports.down = ['DROP TRIGGER IF EXISTS productoInventarioInsert;', 'DROP TRIGGER IF EXISTS productoInventarioUpdate;'];

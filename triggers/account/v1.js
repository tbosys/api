module.exports.up = [
  'DROP TRIGGER IF EXISTS accountParentInsertCheck;',
  'DROP TRIGGER IF EXISTS accountParentUpdateCheck;',
  "CREATE TRIGGER accountParentInsertCheck AFTER INSERT  ON account FOR EACH ROW if new.accountId = new.id then signal sqlstate '45000' set message_text = 'El padre de la cuenta no puede ser si mismo.';end if;",
  "CREATE TRIGGER accountParentUpdatetCheck AFTER UPDATE ON account FOR EACH ROW if new.accountId = new.id then signal sqlstate '45000' set message_text = 'El padre de la cuenta no puede ser si mismo.';end if;",
]

module.exports.down = ['DROP TRIGGER IF EXISTS accountParentInsertCheck;', 'DROP TRIGGER IF EXISTS accountParentUpdateCheck;'];

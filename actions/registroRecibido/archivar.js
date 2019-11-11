var BaseAction = require("../../operation/baseAction");

module.exports = class Archivar extends BaseAction {
  async execute(table, body) {
    this.table = table;
    this.body = body;
    var registros = await this.knex.table("registroRecibido").whereIn("id", body.ids);

    var promises = registros.map(registro => {
      return this.getActionAndInvoke(table, "update", {
        id: registro.id,
        estado: "archivado",
        _forceUpdate: true
      });
    });

    return Promise.all(promises);
  }
};

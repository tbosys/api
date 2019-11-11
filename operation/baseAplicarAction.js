var BaseAction = require("./baseAction");
var Security = require("../apiHelpers/security");

module.exports = class BaseAplicarAction extends BaseAction {
  execute(table, body) {
    this.table = table;
    this.body = body;
    this.metadata = this.getMetadata(this.table);

    return this.aprobar(table, body);
  }

  async aprobar(table, body) {
    var results = await this.enforceStatus(body, ["por aplicar"]);
    var estados = [];
    results.forEach(result => {
      estados.push(result.estado);
    });

    var index = -1;
    estados.forEach(estado => {
      var currentIndex = this.metadata.properties.estado.enum.indexOf(estado);
      if (currentIndex > index && this.metadata.properties.estado.enum[currentIndex + 1])
        index = currentIndex;
    });

    if (index == -1)
      throw new this.Errors.INTEGRATION_ERROR(
        "No se puede utilizar la aplicación dinamica, indiquele a su adminstrador que revise sus estados."
      );
    var newEstado = this.metadata.properties.estado.enum[index + 1].toLowerCase();

    var delta = { estado: newEstado };

    var result = await this.knex
      .table(table)
      .update(delta)
      .whereIn("id", body.ids);

    var indexIds = 0;
    while (indexIds < body.ids.length) {
      await this.saveAudit(body.ids[indexIds], "aplicar", delta);
      indexIds++;
    }

    if (result.length == 0) throw new this.Errors.UPDATE_WITHOUT_RESULT(this.table, body.id);
    return result;
  }
};

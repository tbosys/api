const Errors = require("../errors");
const moment = require("moment");
var Api = require("./index");

var BaseOperation = require("../operation/baseOperation");

class Audit extends BaseOperation {
  get table() {
    return "task";
  }

  get multiTenantObject() {
    return false;
  }

  async query(body) {
    try {
      this.metadata = require("../schema/" + body.type + ".json");
      this.metadata = this.validateMetadata(this.metadata);
    } catch (e) {
      console.log(e);
      throw new Errors.ITEM_NOT_FOUND(`Metadata ${body.type} no se encontro`);
    }

    var ItemOperation = Api.getOperation(body.type);
    var NoteOperation = Api.getOperation("notes");
    var TaskOperation = Api.getOperation("task");
    var ContactoOperation = Api.getOperation("contacto");

    var AuditOperation = Api.getOperation("audit");

    this.item = (await new ItemOperation(this.context, this.user, this.knex).query({
      filters: [[`${body.type}.id`, "=", body.id]]
    }))[0];

    var metrics = await this.loadMetrics(body);

    var tasks = await new TaskOperation(this.context, this.user, this.knex).query({
      type: body.type,
      id: this.metadata.aliasFor ? this.item[this.metadata.aliasFor + "Id"] : body.id
    });

    var contactos = [];

    if (body.type == "cliente")
      contactos = await new ContactoOperation(this.context, this.user, this.knex).query({
        filters: [["contacto.clienteId", "=", body.id]]
      });

    var notes = await new NoteOperation(this.context, this.user, this.knex).query({
      type: this.metadata.key,
      id: this.metadata.aliasFor ? this.item[this.metadata.aliasFor + "Id"] : body.id
    });

    var audits = await new AuditOperation(this.context, this.user, this.knex).query({
      type: body.type,
      id: this.metadata.aliasFor ? this.item[this.metadata.aliasFor + "Id"] : body.id
    });

    return { metrics, tasks, notes, contactos, audits, item: this.item, metadata: this.metadata };
  }

  async getOperation(metric, filters, operation) {
    if (metric.groupBy)
      return operation.groupBy({
        filters: filters,
        ...metric.groupBy
      });
    if (metric.table == "clienteStats") {
      if (!this.clienteStats)
        this.clienteStats = await operation.query({ filters: filters }).then(result => {
          return result[0];
        });
      if (this.clienteStats) return [{ [metric.statKey]: this.clienteStats[metric.statKey] }];
      else return [];
    }
  }

  async loadMetrics(body) {
    var metrics = this.metadata.view && this.metadata.view.metrics ? this.metadata.view.metrics : [];
    var resultMetrics = [];

    resultMetrics = await Promise.all(
      metrics
        .filter(metric => metric.table != null)
        .map(metric => {
          var filters = this.processFilters(metric.filters, body.id);
          var Operation = Api.getOperation(metric.table);
          var operation = new Operation(this.context, this.user, this.knex);

          var operationCommand = this.getOperation(metric, filters, operation);

          return operationCommand.then(result => {
            return { [metric.key]: result };
          });
        })
    );

    var result = {};
    resultMetrics.forEach(metric => {
      result = { ...result, ...metric };
    });
    return result;
  }

  processFilters(filters, id) {
    return filters.map(filter => {
      filter = filter.concat([]);
      var item = this.item;
      if (filter[2] && typeof filter[2] == "string" && filter[2].indexOf("$") == 0 && item) {
        var key = filter[2].replace("$", "");
        if (key.length == 0) key = "id";
        filter[2] = item[key];
      }
      return filter;
    });
  }
}

module.exports = Audit;

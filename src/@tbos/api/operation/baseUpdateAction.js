var BaseAction = require("./baseAction");
var Errors = require("../errors");
var moment = require("moment-timezone");
var Security = require("../apiHelpers/security");

module.exports = class DefaultUpdateAction extends BaseAction {
  async execute(table, body, current) {
    this.table = table;
    this.body = body;
    if (!body.id) throw new Errors.VALIDATION_ERROR(["id"]);

    this.current = await this.knex
      .table(this.table)
      .select()
      .where("id", this.body.id)
      .first();
    if (!this.current || !this.current.id)
      throw new Errors.ITEM_NOT_FOUND(this.table, this.body.id);

    this.metadata = this.getMetadata(this.table);
    return this.update();
  }

  _validate() {
    this.validate(this.table, this.body, false);
  }

  checkSecurity() {
    if (!this.securityChecked)
      Security.checkUpdate(this.metadata, this.user, this.getDeltaFields());
  }

  getDeltaFields() {
    var fields = Object.keys(this.body);
    fields.forEach(field => {
      if (this.body[field] == null) delete this.body[field];
      if (field.indexOf("__") == 0) delete this.body[field];
      else if (field.indexOf("_") == 0) delete this.body[field];
    });
    return fields;
  }

  preTransform() {
    this.json = {};
    var columnKeys = Object.keys(this.metadata.properties);

    var keys = Object.keys(this.body);

    columnKeys.forEach(columnKey => {
      if (this.metadata.properties[columnKey].isJSON) {
        if (this.body[columnKey] && typeof this.body[columnKey] != "string") {
          this.json[columnKey] = this.body[columnKey];
          this.body[columnKey] = JSON.stringify(this.body[columnKey]);
        }
      }
      if (this.metadata.properties[columnKey].isCSV) {
        if (this.body[columnKey] && typeof this.body[columnKey] != "string") {
          this.body[columnKey] = this.body[columnKey].join(",");
        }
      }
      if (
        this.metadata.properties[columnKey].type == "boolean" &&
        this.body[columnKey] != null
      ) {
        this.body[columnKey] = Boolean(this.body[columnKey]);
      }
    });
  }

  preValidate() {}

  async preUpdate() {}

  async postUpdate() {
    return true;
  }

  async update() {
    try {
      this._ = {};
      var fields = Object.keys(this.body);
      fields.forEach(field => {
        if (field.indexOf("__") == 0) {
          this._[field.replace("__", "_")] = this.body[field];
          delete this.body[field];
        } else if (field.indexOf("_") == 0) {
          this._[field.replace("_", "")] = this.body[field];
          delete this.body[field];
        }
      });

      if (
        this.current &&
        this.current[this.metadata.statusField] == "archivado"
      )
        throw new Errors.INVALID_ERROR("ROW_IS_ARCHIVED", [
          this.current.id,
          this.metadata.key
        ]);

      this.preTransform();
      this.preValidate();
      this._validate();
      await this.preUpdate();

      var simpleBody = { ...this.body };
      if (this.metadata.properties.updatedAt)
        simpleBody.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");
      if (this.metadata.properties.updatedBy)
        simpleBody.updatedBy = this.user.name;

      var where = { id: this.body.id };

      if (this.metadata.properties.updatedAt && this._.forceUpdate != true) {
        where.updatedAt = this.body.updatedAt;
      }

      this.checkSecurity();

      this.result = await this.knex
        .table(this.table)
        .update(simpleBody)
        .where(where);

      if (this.result.length == 0)
        throw new Errors.UPDATE_WITHOUT_RESULT(this.table, this.body.id);

      await this.saveAudit(this.body.id, "update", simpleBody);

      var final = await this.knex
        .table(this.table)
        .select()
        .where("id", this.body.id)
        .first();

      await this.postUpdate(final);

      var columnKeys = Object.keys(this.metadata.properties);

      let keys = Object.keys(final);
      keys.forEach(key => {
        if (final[key] == null) delete final[key];
      });

      columnKeys.forEach(columnKey => {
        if (this.metadata.properties[columnKey].isJSON) {
          if (final[columnKey]) {
            final[columnKey] = JSON.parse(final[columnKey]);
          } else {
            final[columnKey] = [];
          }
        }
      });

      return this.result;
    } catch (e) {
      if (e.code == "ER_DUP_ENTRY")
        throw new Errors.DUPLICATE_ERROR(e, this.body);
      throw e;
    }
  }
};

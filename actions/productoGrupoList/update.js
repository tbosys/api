var BaseAction = require("../../operation/baseUpdateAction");

module.exports = class DefaultUpdateAction extends BaseAction {
  async preUpdate() {
    if (this.body.tipos) {
      this.tipos = this.body.tipos;
      delete this.body.tipos;
      var grupoId = this.current.productoGrupoId;

      await this.knex
        .table("productoGrupo")
        .update({ tipos: this.tipos })
        .where("id", grupoId);
    }
    if (this.body.producto) {
      this.producto = this.body.producto;
      delete this.body.producto;
      var productoId = this.current.productoId;

      await this.knex
        .table("producto")
        .update({ atributoPrincipal: this.producto })
        .where("id", productoId);
    }
    if (this.body.presentacion) {
      this.presentacion = this.body.presentacion;
      delete this.body.presentacion;
      var productoId = this.current.productoId;

      await this.knex
        .table("producto")
        .update({ presentacion: this.presentacion })
        .where("id", productoId);
    }
    if (this.body.productoCategoria) {
      this.categoria = this.body.productoCategoria;
      delete this.body.productoCategoria;

      var grupoId = this.current.productoGrupoId;

      var categoria = await this.knex
        .table("productoCategoria")
        .select("id", "productoDepartamentoId")
        .where("name", "=", this.categoria)
        .first();

      if (!categoria) throw new this.Errors.VALIDATION_ERROR("No existe una categoria con ese nombre");
      await this.knex
        .table("productoGrupo")
        .update({ productoCategoriaId: categoria.id })
        .where("id", grupoId);

      return;
      //await this.knex
      //          .table("productoGrupo")
      //        .update({ atributoPrincipal: this.producto })
      //      .where({})
    }
  }
};

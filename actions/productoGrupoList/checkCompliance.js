var BaseAction = require("../../operation/baseAction");

module.exports = class DefaultUpdateAction extends BaseAction {
  async execute() {
    var departamentos = await this.knex.table("productoDepartamento").select();
    var categorias = await this.knex.table("productoCategoria").select();
    var grupos = await this.knex.table("productoGrupo").select();
    var productos = await this.knex
      .table("producto")
      .select("producto.*", "productoGrupoList.productoId")
      .leftJoin("productoGrupoList", "productoGrupoList.productoId", "producto.id")
      .whereNull("productoGrupoList.productoId")
      .where("producto.activo", true);

    var productoIndex = productos.length - 1;
    await this.knex
      .table("productoGrupoList")
      .delete()
      .whereNull("productoGrupoId");

    while (productoIndex > -1) {
      var producto = productos[productoIndex];

      await this.knex.table("productoGrupoList").insert({
        productoId: producto.id,
        createdBy: this.user.id
      });
      productoIndex--;
    }

    var categoriasByDepartamento = {};
    categorias.forEach(categoria => {
      if (!categoriasByDepartamento[categoria.productoDepartamentoId])
        categoriasByDepartamento[categoria.productoDepartamentoId] = [];
      categoriasByDepartamento[categoria.productoDepartamentoId].push(categoria.name);
    });

    var gruposByCategoria = {};
    grupos.forEach(grupo => {
      if (!gruposByCategoria[grupo.productoCategoriaId]) gruposByCategoria[grupo.productoCategoriaId] = [];
      gruposByCategoria[grupo.productoCategoriaId].push(grupo.name);
    });

    var index = departamentos.length - 1;
    while (index > -1) {
      var departamento = departamentos[index];
      if (!categoriasByDepartamento[departamento.id]) categoriasByDepartamento[departamento.id] = [];

      if (categoriasByDepartamento[departamento.id].indexOf(`Otros ${departamento.name}`) == -1)
        await this.knex.table("productoCategoria").insert({
          productoDepartamentoId: departamento.id,
          name: `Otros ${departamento.name}`,
          orden: 10000
        });
      index--;
    }

    var index2 = categorias.length - 1;
    while (index2 > -1) {
      var categoria = categorias[index2];
      if (!gruposByCategoria[categoria.id]) gruposByCategoria[categoria.id] = [];

      if (gruposByCategoria[categoria.id].indexOf("Otros") == -1)
        await this.knex.table("productoGrupo").insert({
          productoCategoriaId: categoria.id,
          name: "Otros"
        });
      index2--;
    }

    return true;
  }
};

const Errors = require("../errors");

var BaseOperation = require("../operation/baseOperation");
var Parser = require("../apiHelpers/xmlParser");
var BodyHelper = require("../operation/bodyHelper");
const AWS = require("aws-sdk");
var moment = require("moment-timezone");
var Promise = require("bluebird");
const s3 = new AWS.S3({
  signatureVersion: "v4"
});

class Ping extends BaseOperation {
  get table() {
    return "";
  }

  get multiTenantObject() {
    return false;
  }

  async ping() {
    return this.knex
      .table("cliente")
      .select()
      .first();
  }

  async hour(body) {
    await this.getActionAndInvoke("registroContinuo", "marcar", body);
    await this.updateUsers();
    await this.clienteStats(body);
    // await this.getActionAndInvoke("account", "marcar", body);
    return { success: true };
  }

  async day(body) {
    await this.inventarioHistorico(body);
    await this.saldoHistorico(body);
    await this.archivarOrdenes(body);
    //await this.checkCompliance(body);
    await this.productoStats(body);

    return { success: true };
  }

  async clienteStats(body) {
    try {
      return this.getActionAndInvoke("cliente", "stats", body);
    } catch (e) {
      console.log(e);
      return Promise.resolve({});
    }
  }

  async updateUsers(body) {
    var users = this.context.users;
    var count = users.length - 1;
    while (count > -1) {
      var user = users[count];
      var dbuser = await this.knex
        .table("owner")
        .select()
        .where("id", user.id);
      if (!dbuser) {
        await this.knex.table("owner").insert({
          comisiona: user.comisiona,
          email: user.email,
          name: user.name,
          id: user.id
        });
      } else {
        await this.knex
          .table("owner")
          .update({
            comisiona: user.comisiona,
            email: user.email,
            name: user.name
          })
          .where("id", user.id);
      }
      count--;
    }

    return this.context.users;
  }

  async checkCompliance(body) {
    try {
      return this.getActionAndInvoke("productoGrupoList", "checkCompliance", body);
    } catch (e) {
      console.log(e);
      return Promise.resolve({});
    }
  }

  async archivarOrdenes(body) {
    try {
      return this.getActionAndInvoke("orden", "archivar", body);
    } catch (e) {
      console.log(e);
      return Promise.resolve({});
    }
  }

  async productoStats(body) {
    try {
      return this.getActionAndInvoke("producto", "stats", body);
    } catch (e) {
      console.log(e);
      return Promise.resolve({});
    }
  }

  async registroGeneral(body) {
    try {
      return this.getActionAndInvoke("registroGeneral", "marcar", body);
    } catch (e) {
      console.log(e);
      return Promise.resolve({});
    }
  }

  async registroContinuo(body) {
    try {
      return this.getActionAndInvoke("registroContinuo", "marcar", body);
    } catch (e) {
      console.log(e);
      return Promise.resolve({});
    }
  }

  async inventarioHistorico(body) {
    try {
      var productos = await this.knex
        .table("producto")
        .select("producto.*", "costoHistorico.costo")
        .innerJoin("costoHistorico", "costoHistorico.id", "producto.costoHistoricoId");

      await this.knex.table("inventarioHistorico").insert(
        productos.map(producto => {
          return {
            namespaceId: process.env.NODE_ENV,
            inventario: producto.inventario,
            productoId: producto.id,
            costo: producto.costo
          };
        })
      );

      return { success: true };
    } catch (e) {
      console.log(e);
      return Promise.resolve({});
    }
  }

  async saldoHistorico(body) {
    try {
      var saldos = await this.knex.table("saldo").select("*");

      await this.knex.table("saldoHistory").insert(
        saldos.map(saldo => {
          return {
            clienteId: saldo.clienteId,
            documentoId: saldo.documentoId,
            total: saldo.total
          };
        })
      );

      return { success: true };
    } catch (e) {
      console.log(e);
      return Promise.resolve({});
    }
  }
}

module.exports = Ping;
